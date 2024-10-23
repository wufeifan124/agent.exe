Presenting **Agent.exe**: the easiest way to let Claude take over your computer!

To run:

1.  `git clone https://github.com/corbt/agent.exe`
2.  `cd agent.exe`
3.  `npm install`
4.  `ANTHROPIC_API_KEY="<your-anthropic-api-key>" npm start`
5.  Prompt the model to do something interesting on your computer!

Supported systems:

- MacOS
- Theoretically Windows and Linux since all the deps are cross-platform

Known limitations:

- Only works on the primary display
- Lets an AI completely take over your computer
- Oh jeez, probably lots of other stuff too

Tips:

- Claude _really_ likes Firefox. It will use other browsers if it absolutely has to, but will behave so much better if you just install Firefox and let it go to its happy place.

Roadmap:

- I literally wrote this in 6 hours, probably isn't going anywhere. But I will review PRs and merge them if they seem cool.
