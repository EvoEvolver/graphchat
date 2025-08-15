import asyncio
from gchat_sdk import GraphChatSDK


# example of message :{"id":1755220895624,"date":{},"sender":"You","content":"<p>das</p>"}
async def main():
    ydoc_client = GraphChatSDK()
    
    # Run the client non-blockingly using create_task (like original)
    client_task = await ydoc_client.start_background_client()
    
    # Add other tasks or logic here
    iteration = 0
    while True:
        print("Main loop running...")
        
        # Get current messages
        messages = ydoc_client.get_messages()
        print("Current messages count:", len(messages))
        for msg in messages[-3:]:  # Show last 3 messages
            if isinstance(msg, dict):
                print(f"  - {msg.get('sender', 'Unknown')}: {msg.get('content', '')}")
        
        # Occasionally add a message
        if iteration % 5 == 0:
            ydoc_client.add_message("System", f"Auto message #{iteration//5}")
        
        # Show other document state
        xyz_length = len(ydoc_client.get_xyz_text()) if ydoc_client.get_xyz_text() else 0
        graph_count = len(ydoc_client.get_graph_nodes())
        print(f"XYZ length: {xyz_length}, Graph nodes: {graph_count}")
        
        await asyncio.sleep(1)
        iteration += 1


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutting down...")