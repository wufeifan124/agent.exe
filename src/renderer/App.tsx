import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Button,
  Link,
  RadioGroup,
  Radio,
  HStack,
  extendTheme,
} from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';

function Hello() {
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
        />
        <HStack justify="space-between" align="center" w="100%">
          <RadioGroup defaultValue="human">
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
            fontFamily="Garamond, serif"
            fontWeight="hairline"
            fontSize="xl"
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
          >
            Let&apos;s Go
          </Button>
        </HStack>
      </VStack>
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
            <Route path="/" element={<Hello />} />
          </Routes>
        </Router>
      </Box>
    </ChakraProvider>
  );
}
