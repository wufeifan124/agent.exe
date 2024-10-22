import fs from 'fs';
import { desktopCapturer, screen } from 'electron';
import os from 'os';
import path from 'path';
import { keyboard, mouse, Point, Button } from '@nut-tree-fork/nut-js';
import { anthropic } from './anthropic';
import { AppState } from './types';

type NextAction =
  | { type: 'key'; text: string }
  | { type: 'type'; text: string }
  | { type: 'mouse_move'; x: number; y: number }
  | { type: 'left_click' }
  | { type: 'left_click_drag'; x: number; y: number }
  | { type: 'right_click' }
  | { type: 'middle_click' }
  | { type: 'double_click' }
  | { type: 'screenshot' }
  | { type: 'cursor_position' }
  | { type: 'finish' }
  | { type: 'error'; message: string };

function getScreenDimensions(): { width: number; height: number } {
  const primaryDisplay = screen.getPrimaryDisplay();
  return primaryDisplay.size;
}

function getAiScaledScreenDimensions(): { width: number; height: number } {
  const { width, height } = getScreenDimensions();
  const aspectRatio = width / height;

  let scaledWidth: number;
  let scaledHeight: number;

  if (aspectRatio > 1280 / 800) {
    // Width is the limiting factor
    scaledWidth = 1280;
    scaledHeight = Math.round(1280 / aspectRatio);
  } else {
    // Height is the limiting factor
    scaledHeight = 800;
    scaledWidth = Math.round(800 * aspectRatio);
  }

  return { width: scaledWidth, height: scaledHeight };
}

const getScreenshot = async () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const aiDimensions = getAiScaledScreenDimensions();

  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width, height },
    });
    const primarySource = sources[0]; // Assuming the first source is the primary display

    if (primarySource) {
      const screenshot = primarySource.thumbnail;
      // Resize the screenshot to AI dimensions
      const resizedScreenshot = screenshot.resize(aiDimensions);
      // Convert the resized screenshot to a base64-encoded PNG
      const base64Image = resizedScreenshot.toPNG().toString('base64');
      return `data:image/png;base64,${base64Image}`;
    }
    throw new Error('No display found for screenshot');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  }
};

const mapToAiSpace = (x: number, y: number) => {
  const { width, height } = getScreenDimensions();
  const aiDimensions = getAiScaledScreenDimensions();
  return {
    x: (x * aiDimensions.width) / width,
    y: (y * aiDimensions.height) / height,
  };
};

const mapFromAiSpace = (x: number, y: number) => {
  const { width, height } = getScreenDimensions();
  const aiDimensions = getAiScaledScreenDimensions();
  return {
    x: (x * width) / aiDimensions.width,
    y: (y * height) / aiDimensions.height,
  };
};

const getNextAction = async (
  instructions: string,
): Promise<{ action: NextAction; reasoning?: string }> => {
  const message = await anthropic.beta.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    tools: [
      {
        type: 'computer_20241022',
        name: 'computer',
        display_width_px: getAiScaledScreenDimensions().width,
        display_height_px: getAiScaledScreenDimensions().height,
        display_number: 1,
      },
    ],
    system: `The user will ask you to perform a task and you should use their computer to do so. After each step, take a screenshot and carefully evaluate if you have achieved the right outcome. Explicitly show your thinking: "I have evaluated step X..." If not correct, try again. Only when you confirm a step was executed correctly should you move on to the next one.`,
    messages: [{ role: 'user', content: instructions }],
    betas: ['computer-use-2024-10-22'],
  });

  console.log(JSON.stringify(message, null, 2));

  const reasoning = message.content
    .filter((content) => content.type === 'text')
    .map((content) => content.text)
    .join(' ');

  const lastMessage = message.content[message.content.length - 1];

  if (lastMessage.type !== 'tool_use') {
    return {
      action: { type: 'error', message: 'No tool called' },
      reasoning,
    };
  }
  if (lastMessage.name !== 'computer') {
    return {
      action: {
        type: 'error',
        message: `Wrong tool called: ${lastMessage.name}`,
      },
      reasoning,
    };
  }

  const { action, coordinate, text } = lastMessage.input as {
    action: string;
    coordinate?: [number, number];
    text?: string;
  };

  // Convert toolUse into NextAction
  let nextAction: NextAction;
  switch (action) {
    case 'type':
    case 'key':
      if (!text) {
        nextAction = {
          type: 'error',
          message: `No text provided for ${action}`,
        };
      } else {
        nextAction = { type: action, text };
      }
      break;
    case 'mouse_move':
      if (!coordinate) {
        nextAction = { type: 'error', message: 'No coordinate provided' };
      } else {
        const [x, y] = coordinate;
        nextAction = { type: 'mouse_move', x, y };
      }
      break;
    case 'left_click':
      nextAction = { type: 'left_click' };
      break;
    case 'left_click_drag':
      nextAction = { type: 'left_click_drag', x, y };
      break;
    case 'right_click':
      nextAction = { type: 'right_click' };
      break;
    case 'middle_click':
      nextAction = { type: 'middle_click' };
      break;
    case 'double_click':
      nextAction = { type: 'double_click' };
      break;
    case 'screenshot':
      nextAction = { type: 'screenshot' };
      break;
    case 'cursor_position':
      nextAction = { type: 'cursor_position' };
      break;
    case 'finish':
      nextAction = { type: 'finish' };
      break;
    default:
      nextAction = {
        type: 'error',
        message: `Unsupported computer action: ${action}`,
      };
  }

  return { action: nextAction, reasoning };
};

export const performAction = async (action: NextAction) => {
  switch (action.type) {
    case 'mouse_move':
      const { x, y } = action;
      await mouse.setPosition(new Point(x, y));
      break;
    case 'left_click':
      await mouse.leftClick();
      break;
    case 'right_click':
      await mouse.rightClick();
      break;
    case 'middle_click':
      await mouse.click(Button.MIDDLE);
      break;
    case 'double_click':
      await mouse.doubleClick(Button.LEFT);
      break;
    case 'left_click_drag':
      const { x: dragX, y: dragY } = action;
      const currentPosition = await mouse.getPosition();
      await mouse.drag([currentPosition, new Point(dragX, dragY)]);
      break;
    case 'type':
    case 'key':
      await keyboard.type(action.text);
      break;
    case 'cursor_position':
      const position = await mouse.getPosition();
      console.log(`Cursor position: x=${position.x}, y=${position.y}`);
      break;
    case 'screenshot':
      const screenshot = await getScreenshot();
      console.log('SCREENSHOT', screenshot);
      break;
    default:
      console.warn(`Unsupported action: ${action.type}`);
  }
};

export const startRun = async (
  setState: (state: AppState) => void,
  getState: () => AppState,
  payload: { instructions: string; humanSupervised: boolean },
) => {
  setState({
    ...getState(),
    ...payload,
    running: true,
  });

  // Capture high-quality screenshot
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width, height },
    });
    const primarySource = sources[0]; // Assuming the first source is the primary display

    if (primarySource) {
      const screenshot = primarySource.thumbnail;
      // save to desktop
      const desktopPath = path.join(os.homedir(), 'Desktop');
      const screenshotPath = path.join(
        desktopPath,
        'high_quality_screenshot.png',
      );
      fs.writeFileSync(screenshotPath, screenshot.toPNG());

      console.log(
        `Screenshot captured at native resolution: ${width}x${height}`,
      );
    } else {
      console.error('No display found for screenshot');
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  }

  const { action, reasoning } = await getNextAction(payload.instructions);
  console.log('REASONING', reasoning);
  console.log('ACTION', action);

  if (action.type === 'error') {
    setState({
      ...getState(),
      error: action.message,
    });
  } else if (action.type === 'finish') {
    setState({
      ...getState(),
      running: false,
    });
  } else {
    performAction(action);
  }
};
