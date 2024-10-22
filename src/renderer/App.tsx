import {
  Box,
  Button,
  ChakraProvider,
  HStack,
  Heading,
  Link,
  Radio,
  RadioGroup,
  VStack,
  extendTheme,
} from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { useDispatch } from 'zutron';
import { useStore } from './hooks/useStore';
import { useState } from 'react';

function TestZustand() {
  const { counter } = useStore();
  const dispatch = useDispatch(window.zutron);

  const onClick = () => dispatch({ type: 'SET_COUNTER', payload: counter + 3 });
  return <Box onClick={onClick}>{counter}</Box>;
}

function Main() {
  const dispatch = useDispatch(window.zutron);
  const [instructions, setInstructions] = useState('');
  const [humanSupervised, setHumanSupervised] = useState(true);

  const startRun = () =>
    dispatch({ type: 'START_RUN', payload: { instructions, humanSupervised } });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      startRun();
    }
  };

  return (
    <Box position="relative" w="100%" h="100vh" p={4}>
      <Box position="absolute" top={0} right={0}>
        <Link href="https://github.com/corbt/agent.exe" isExternal>
          <Button variant="ghost" size="lg" aria-label="GitHub">
            <FaGithub />
          </Button>
        </Link>
      </Box>
      <VStack spacing={6} align="center" h="100%" w="100%" justify="center">
        <Heading fontFamily="Garamond, serif" fontWeight="hairline">
          Agent.exe
        </Heading>
        <Box
          as="textarea"
          placeholder="What can I do for you today?"
          width="100%"
          height="100px"
          p={4}
          borderRadius="16px"
          border="1px solid"
          borderColor="rgba(112, 107, 87, 0.5)"
          verticalAlign="top"
          resize="none"
          transition="box-shadow 0.2s, border-color 0.2s"
          _hover={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
          _focus={{
            borderColor: 'blackAlpha.500',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <HStack justify="space-between" align="center" w="100%">
          <RadioGroup
            value={humanSupervised ? 'human' : 'lucky'}
            onChange={(value) => setHumanSupervised(value === 'human')}
          >
            <HStack spacing={4}>
              <Radio value="human" bg="whiteAlpha.700">
                Human Supervised
              </Radio>
              <Radio value="lucky" bg="whiteAlpha.700">
                I'm Feeling Lucky
              </Radio>
            </HStack>
          </RadioGroup>
          <Button
            bg="transparent"
            fontWeight="normal"
            _hover={{
              bg: 'whiteAlpha.500',
              borderColor: 'blackAlpha.300',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
            }}
            _focus={{
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
              outline: 'none',
            }}
            borderRadius="12px"
            border="1px solid"
            borderColor="blackAlpha.200"
            onClick={startRun}
            isDisabled={instructions.trim() === ''}
          >
            Let&apos;s Go
          </Button>
        </HStack>
      </VStack>
      {/* <TestZustand /> */}
    </Box>
  );
}

const theme = extendTheme({
  styles: {
    global: {
      body: {
        color: 'rgb(83, 81, 70)',
      },
    },
  },
});

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box bg="rgb(240, 238, 229)" minHeight="100vh">
        <Router>
          <Routes>
            <Route path="/" element={<Main />} />
          </Routes>
        </Router>
      </Box>
    </ChakraProvider>
  );
}
