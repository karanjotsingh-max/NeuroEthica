import asyncio, websockets

async def main():
    url = "ws://127.0.0.1:8000/ws/eeg"
    print(f"Connecting to {url} ...")
    async with websockets.connect(url) as ws:
        for i in range(5):
            msg = await ws.recv()
            print(f"Message {i+1}:", msg[:200], "...\n")  # show first 200 chars
    print("Done!")

asyncio.run(main())
