# GraphChat Python SDK

A comprehensive Python SDK for interacting with GraphChat frontend YDoc structures. This SDK provides real-time collaborative editing capabilities for molecular structures (XYZ format), chat messages, and graph visualizations.

## Features

- **Real-time collaboration** via WebSocket connections
- **XYZ molecular structure management** (get, set, insert, delete operations)
- **Chat message handling** (add, retrieve, delete messages)
- **Graph visualization operations** (add, update, delete nodes)
- **Change observers** for real-time updates
- **Data validation** for XYZ format and graph nodes
- **Import/Export** capabilities with JSON format
- **Context manager** for automatic connection handling
- **Error handling** and connection management

## Installation

```bash
pip install httpx-ws pycrdt pycrdt-websocket
```

## Quick Start

### Basic Usage

```python
import asyncio
from gchat_sdk import GraphChatClient

async def main():
    # Using context manager (recommended)
    async with GraphChatClient() as client:
        # Set XYZ molecular data
        xyz_data = """8
Caffeine partial structure
N   -0.520   1.410   0.000
C   -1.780   0.860   0.000
N   -1.780  -0.450   0.000
C   -0.520  -1.040   0.000
C    0.650  -0.280   0.000
C    0.650   1.020   0.000
N    1.900  -0.870   0.000
C    1.900  -2.200   0.000"""
        
        client.set_xyz_text(xyz_data)
        
        # Add chat messages
        client.add_message("System", "Welcome to GraphChat!")
        client.add_message("User", "Hello, world!")
        
        # Add graph nodes
        client.add_graph_node("input", "Input Layer", "Data preprocessing")
        client.add_graph_node("output", "Output Layer", "Results", in_node_id="input")
        
        # Get current state
        print(f"Messages: {len(client.get_messages())}")
        print(f"Graph nodes: {len(client.get_graph_nodes())}")

asyncio.run(main())
```

### Manual Connection Management

```python
import asyncio
from gchat_sdk import GraphChatSDK

async def main():
    sdk = GraphChatSDK()
    
    try:
        await sdk.connect()
        
        # Your operations here
        sdk.add_message("Bot", "Connected successfully!")
        messages = sdk.get_messages()
        print(f"Total messages: {len(messages)}")
        
    finally:
        await sdk.disconnect()

asyncio.run(main())
```

## API Reference

### GraphChatSDK Class

#### Connection Management

- `__init__(websocket_url="http://localhost:3000", room_name="room")`: Initialize SDK
- `async connect()`: Establish WebSocket connection
- `async disconnect()`: Close WebSocket connection
- `add_change_observer(callback)`: Add change event observer
- `remove_change_observer(callback)`: Remove change event observer

#### XYZ Text Operations

- `get_xyz_text() -> str`: Get current XYZ molecular structure
- `set_xyz_text(xyz_content: str)`: Replace all XYZ content
- `insert_xyz_text(position: int, content: str)`: Insert text at position
- `delete_xyz_text(start: int, length: int)`: Delete text range
- `validate_xyz_format(xyz_content: str) -> bool`: Validate XYZ format

#### Message Operations

- `get_messages() -> List[Dict]`: Get all messages
- `add_message(sender: str, content: str) -> Dict`: Add new message
- `clear_messages()`: Clear all messages
- `get_message_by_id(message_id: int) -> Optional[Dict]`: Get message by ID
- `delete_message_by_id(message_id: int) -> bool`: Delete message by ID

#### Graph Operations

- `get_graph_nodes() -> List[Dict]`: Get all graph nodes
- `add_graph_node(node_id, name, description="", in_node_id=None, out_node_ids=None) -> Dict`: Add node
- `update_graph_node(node_id: str, updates: Dict) -> bool`: Update existing node
- `delete_graph_node(node_id: str) -> bool`: Delete node by ID
- `get_graph_node_by_id(node_id: str) -> Optional[Dict]`: Get node by ID
- `clear_graph()`: Clear all nodes
- `set_graph_nodes(nodes: List[Dict])`: Replace all nodes
- `validate_graph_node(node: Dict) -> bool`: Validate node structure

#### Utility Methods

- `get_document_state() -> Dict`: Get current state of all structures
- `export_to_json(file_path: str)`: Export state to JSON file
- `load_from_json(file_path: str)`: Load state from JSON file

### GraphChatClient Class

Context manager wrapper for automatic connection handling:

```python
async with GraphChatClient(websocket_url, room_name) as client:
    # client is a connected GraphChatSDK instance
    pass  # automatically disconnected when exiting context
```

## Data Formats

### XYZ Molecular Structure

```
8
Caffeine partial structure
N   -0.520   1.410   0.000
C   -1.780   0.860   0.000
N   -1.780  -0.450   0.000
C   -0.520  -1.040   0.000
C    0.650  -0.280   0.000
C    0.650   1.020   0.000
N    1.900  -0.870   0.000
C    1.900  -2.200   0.000
```

### Message Format

```python
{
    "id": 1692123456789,  # timestamp in milliseconds
    "date": "2023-08-15T12:34:56",
    "sender": "User",
    "content": "Hello, world!"
}
```

### Graph Node Format

```python
{
    "id": "node1",
    "name": "Input Layer",
    "description": "Data preprocessing and feature extraction",
    "in_node_id": "previous_node",  # optional
    "out_node_id": ["next_node1", "next_node2"]  # optional
}
```

## Examples

See `examples.py` for comprehensive usage examples including:

- Basic operations
- Advanced features with change observers
- Real-time collaboration between multiple clients
- Data migration with import/export
- Error handling best practices

## Real-time Collaboration

The SDK supports real-time collaboration through YDoc's operational transformation:

```python
def on_document_change(event):
    print(f"Document updated: {event}")

sdk.add_change_observer(on_document_change)
```

Multiple clients can simultaneously edit the same document, and changes are automatically synchronized across all connected clients.

## Error Handling

The SDK raises specific exceptions for different error conditions:

- `RuntimeError`: When attempting operations without connection
- `ConnectionError`: When WebSocket connection fails
- `ValueError`: When data validation fails

Always wrap SDK operations in try-catch blocks for robust error handling.

## Requirements

- Python 3.7+
- httpx-ws
- pycrdt
- pycrdt-websocket

## License

MIT License