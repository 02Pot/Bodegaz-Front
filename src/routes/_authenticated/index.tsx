import { Box, Text } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <>
      <Box>
        <Text>Test</Text>
      </Box>
    </>
  )
}
