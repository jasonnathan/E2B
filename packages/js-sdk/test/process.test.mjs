import { Session } from '../src'
import { expect, test, vi } from 'vitest'

test('process on stdout/stderr', async () => {
  const session = await Session.create({ id: "Nodejs" })

  const stdout = []
  const stderr = []

  const process = await session.process.start({
    cmd: "pwd",
    onStdout: data => stdout.push(data),
    onStderr: data => stderr.push(data),
    rootdir: "/tmp"
  })
  
  const output = await process.finished

  expect(output.error).toEqual(false)
  expect(output.stdout).toEqual("/tmp")
  expect(output.stderr).toEqual("")
  expect(stdout.map(message => message.line)).toEqual(["/tmp"])
  expect(stderr).toEqual([])
  await session.close()
})

test('process on exit', async () => {
  const session = await Session.create({ id: "Nodejs" })

  const onExit = vi.fn(() => {})

  const process = await session.process.start({
    cmd: "pwd",
    onExit
  })

  await process.finished
  expect(onExit).toHaveBeenCalled()

  await session.close()
})

test('process send stdin', async () => {
  const session = await Session.create({ id: "Nodejs" })

  const process = await session.process.start({
    cmd: 'while IFS= read -r line; do echo "$line"; sleep 1; done',
    rootdir: "/code"
  })
  await process.sendStdin("ping\n")
  await process.kill()
  
  expect(process.output.stdout).toEqual("ping")
  // TODO: Parity with Python SDK
  // expect(process.output.messages.length).toEqual(1) 
  // const message = process.output_messages[0]
  // assert.equal(message.line, "ping")
  // assert.equal(message.error, false)

  await session.close()
})
