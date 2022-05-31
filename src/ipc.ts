import net from 'net'
import EventEmitter from 'events'
import { createUUID } from './utils'
import RPCClient from './client'

interface IncomingPacket {
	op: 0 | 1 | 2 | 3 | 4 | undefined
	data: any
}

const OPCodes = {
	HANDSHAKE: 0,
	FRAME: 1,
	CLOSE: 2,
	PING: 3,
	PONG: 4,
}

const getIPCPath = (id: number): string => {
	if (process.platform === 'win32') return `\\\\?\\pipe\\discord-ipc-${id}`

	const {
		env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP },
	} = process

	const prefix = XDG_RUNTIME_DIR || TMPDIR || TMP || TEMP || '/tmp'

	return `${prefix.replace(/\/$/, '')}/discord-ipc-${id}`
}

const getIPC = (id = 0): Promise<net.Socket> => {
	return new Promise((resolve, reject) => {
		const path = getIPCPath(id)

		const onError = (): void => {
			if (id < 10) {
				resolve(getIPC(id + 1))
			} else {
				reject(new Error(`Could not connect ${path} ${id}`))
			}
		}

		const socket = net.createConnection(path, () => {
			socket.removeListener('error', onError)
			resolve(socket)
		})

		socket.once('error', onError)
	})
}

export const encode = (op: number, data: any): Buffer => {
	const dataString = JSON.stringify(data)
	const length = Buffer.byteLength(dataString)
	const packet = Buffer.alloc(8 + length)

	packet.writeInt32LE(op, 0)
	packet.writeInt32LE(length, 4)
	packet.write(dataString, 8, length)
	return packet
}

export const decode = (socket: net.Socket, callback: (response: IncomingPacket) => void) => {
	const packet = socket.read()

	if (!packet) return

	let { op } = working
	let raw

	if (working.full === '') {
		op = working.op = packet.readInt32LE(0)
		const length = packet.readInt32LE(4)
		raw = packet.slice(8, length + 8)
	} else {
		raw = packet.toString()
	}

	try {
		const data = JSON.parse(working.full + raw)
		callback({ op, data }) // eslint-disable-line callback-return
		working.full = ''
		working.op = undefined
	} catch (err) {
		working.full += raw
	}

	decode(socket, callback)
}

const working = {
	full: '',
	op: undefined,
}

export class IPCTransport extends EventEmitter {
	constructor(client: RPCClient) {
		super()

		this.client = client
		this.socket = null
	}

	client: RPCClient
	socket: null | net.Socket
	pingInterval: any

	public connect = async (): Promise<any> => {
		if (this.socket) this.socket.destroy()

		const socket = (this.socket = await getIPC())
		socket.on('close', this.onClose.bind(this))

		socket.on('error', this.onClose.bind(this))

		this.emit('open')

		socket.write(
			encode(OPCodes.HANDSHAKE, {
				v: 1,
				client_id: this.client.instance.config.clientID,
			})
		)

		socket.pause()

		socket.on('readable', () => {
			decode(socket, ({ op, data }) => {
				if (op === 0) {
					// Unused
				} else if (op === OPCodes.FRAME) {
					if (!data) return
					this.emit('message', data)
				} else if (op === OPCodes.CLOSE) {
					// Unused
				} else if (op === OPCodes.PING) {
					this.send(data, OPCodes.PONG)
				} else if (op === OPCodes.PONG) {
					// Unused
				}
			})
		})
	}

	public onClose = (e: any): void => {
		this.emit('close', e)
	}

	public send = (data: any, op = OPCodes.FRAME): void => {
		if (this.socket === null) return

		const packet = encode(op, data)
		this.socket.write(packet)
	}

	public close = (): Promise<void> => {
		return new Promise((resolve) => {
			if (this.socket === null) resolve()

			if (this.pingInterval) clearInterval(this.pingInterval)

			this.once('close', resolve)
			this.send({}, OPCodes.CLOSE)
			this.socket?.end()
		})
	}

	public ping = (): void => {
		this.send(createUUID(), OPCodes.PING)
	}
}
