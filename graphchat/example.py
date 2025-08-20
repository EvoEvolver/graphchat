import asyncio
from gchat_sdk import GraphChatSDK




async def main():
    """Example showing background client usage like the original main.py"""
    client = GraphChatSDK()
    await client.start_background_client()

    print("Background client started, beginning main loop...")
    client.add_graph_node("input", "Input Layer", "Data preprocessing", out_node_ids=["hidden1"])
    client.add_graph_node("hidden1", "Hidden Layer 1", "First processing layer",
                          in_node_id="input", out_node_ids=["output"])
    client.add_graph_node("output", "Output Layer", "Final results", in_node_id="hidden1")
    try:
        # Main loop that can do other work while client runs in background
        iteration = 0
        xyz = """C -0.520 1.410 0\nC -1.780 0.860 1.000"""
        while iteration < 5:  # Limited iterations for demo
            messages = client.get_messages()
            client.add_message("Bot", f"【托尔斯泰】 Message from iteration {iteration} 2\nCaffeine partial structure\nN -0.520 1.410 {str(0.000+iteration*1)}\nC -1.780 0.860 1.000")
            xyz += f"\nN -0.520 1.410 {str(0.000+iteration*1)}"
            full_xyz = f"""{len(xyz.split("\n"))}\n\n{xyz}"""
            client.set_xyz_text(full_xyz)
            await asyncio.sleep(2)  # Wait 2 seconds between iterations
            iteration += 1

    except KeyboardInterrupt:
        print("Interrupted by user")
    finally:
        print("Shutting down...")
        await client.disconnect()
        print("Client disconnected")

async def run_all_examples():
    """Run all background examples"""
    await main()

if __name__ == "__main__":
    # Run the background client example
    asyncio.run(run_all_examples())