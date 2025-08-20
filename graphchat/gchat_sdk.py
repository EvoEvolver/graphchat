import asyncio
import json
from datetime import datetime
from typing import List, Dict, Any, Optional, Callable

from httpx_ws import aconnect_ws
from pycrdt import Doc, Array, Text, TransactionEvent
from pycrdt_websocket import WebsocketProvider
from pycrdt_websocket.websocket import HttpxWebsocket


class GraphChatSDK:
    """
    Python SDK for interacting with GraphChat frontend YDoc structures.
    Provides methods to operate on xyz text, messages array, and graph array.
    """

    def __init__(self, websocket_url: str = "http://localhost:3000", room_name: str = "room"):
        self.websocket_url = websocket_url
        self.room_name = room_name
        self.ydoc = Doc()
        self.is_connected = False
        self.websocket_provider = None
        self.change_observers: List[Callable] = []

        # Initialize YDoc structures
        self._xyz_text: Text | None = None
        self._messages_array: Array | None = None
        self._graph_array: Array | None = None
        
        # Initialize context managers
        self._ws_context = None
        self._provider_context = None
        self._background_task = None

    async def connect(self):
        """Establish WebSocket connection to the YDoc server."""
        try:
            # Store context managers for proper cleanup
            self._ws_context = aconnect_ws(f"{self.websocket_url}/{self.room_name}")
            self.websocket = await self._ws_context.__aenter__()
            
            self._provider_context = WebsocketProvider(
                self.ydoc,
                HttpxWebsocket(self.websocket, self.room_name)
            )
            self.websocket_provider = await self._provider_context.__aenter__()

            # Initialize document structures
            self._xyz_text = self.ydoc.get("xyz", type=Text)
            self._messages_array = self.ydoc.get("messages", type=Array)
            self._graph_array = self.ydoc.get("graph", type=Array)

            # Set up change observer
            def on_change(change: TransactionEvent):
                for observer in self.change_observers:
                    observer(change)

            self.ydoc.observe(on_change)
            self.is_connected = True

        except Exception as e:
            raise ConnectionError(f"Failed to connect to WebSocket: {e}")

    async def start_background_client(self):
        """Start the WebSocket client as a background task."""
        await self.connect()
        
        # Create a background task to keep the connection alive
        self._background_task = asyncio.create_task(self._keep_alive())
        
        return self._background_task
    
    async def _keep_alive(self):
        """Keep the WebSocket connection alive in the background."""
        try:
            # Run forever to keep the connection alive
            await asyncio.Future()
        except asyncio.CancelledError:
            # Handle graceful shutdown
            await self.disconnect()
            raise

    async def disconnect(self):
        """Disconnect from WebSocket server."""
        # Cancel background task if it exists
        if self._background_task and not self._background_task.done():
            self._background_task.cancel()
            try:
                await self._background_task
            except asyncio.CancelledError:
                pass
        
        try:
            if hasattr(self, '_provider_context') and self._provider_context:
                await self._provider_context.__aexit__(None, None, None)
        except Exception:
            pass
        
        try:
            if hasattr(self, '_ws_context') and self._ws_context:
                await self._ws_context.__aexit__(None, None, None)
        except Exception:
            pass
        
        self.is_connected = False

    def add_change_observer(self, callback: Callable[[TransactionEvent], None]):
        """Add a callback function to observe document changes."""
        self.change_observers.append(callback)

    def remove_change_observer(self, callback: Callable[[TransactionEvent], None]):
        """Remove a change observer callback."""
        if callback in self.change_observers:
            self.change_observers.remove(callback)

    # XYZ Text Operations
    def get_xyz_text(self) -> str:
        """Get the current XYZ molecular structure text."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")
        return str(self._xyz_text)

    def set_xyz_text(self, xyz_content: str):
        """Set the XYZ molecular structure text, replacing all content."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")

        # Clear existing content and insert new content
        current_length = len(self._xyz_text)
        if current_length > 0:
            self._xyz_text.clear()
        self._xyz_text.insert(0, xyz_content)

    def insert_xyz_text(self, position: int, content: str):
        """Insert text into XYZ content at specified position."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")
        self._xyz_text.insert(position, content)

    def delete_xyz_text(self, start: int, length: int):
        """Delete text from XYZ content starting at position for given length."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")
        self._xyz_text.clear()

    def validate_xyz_format(self, xyz_content: str) -> bool:
        """Validate XYZ file format."""
        lines = xyz_content.strip().split('\n')
        if len(lines) < 2:
            return False

        try:
            # First line should be number of atoms
            num_atoms = int(lines[0])
            # Should have at least num_atoms + 2 lines (count, comment, atoms)
            return len(lines) >= num_atoms + 2
        except ValueError:
            return False

    # Messages Array Operations
    def get_messages(self) -> List[Dict[str, Any]]:
        """Get all messages from the messages array."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")
        return [dict(msg) if hasattr(msg, '__iter__') else msg for msg in self._messages_array]

    def add_message(self, sender: str, content: str) -> Dict[str, Any]:
        """Add a new message to the messages array."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")

        now = datetime.now()
        message = {
            "id": int(now.timestamp() * 1000),
            "date": now.isoformat(),
            "sender": sender,
            "content": content
        }

        self._messages_array.append(message)
        return message

    def clear_messages(self):
        """Clear all messages from the array."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")

        length = len(self._messages_array)
        if length > 0:
            self._messages_array.clear()

    def get_message_by_id(self, message_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific message by its ID."""
        messages = self.get_messages()
        for msg in messages:
            if msg.get("id") == message_id:
                return msg
        return None

    def delete_message_by_id(self, message_id: int) -> bool:
        """Delete a message by its ID."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")

        for i, msg in enumerate(self._messages_array):
            if isinstance(msg, dict) and msg.get("id") == message_id:
                self._messages_array.pop(i)
                return True
        return False

    # Graph Array Operations
    def get_graph_nodes(self) -> List[Dict[str, Any]]:
        """Get all nodes from the graph array."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")
        return [dict(node) if hasattr(node, '__iter__') else node for node in self._graph_array]

    def add_graph_node(self, node_id: str, name: str, description: str = "",
                       in_node_id: Optional[str] = None,
                       out_node_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """Add a new node to the graph."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")

        node = {
            "id": node_id,
            "name": name,
            "description": description
        }

        if in_node_id:
            node["in_node_id"] = in_node_id

        if out_node_ids:
            node["out_node_id"] = out_node_ids

        self._graph_array.append(node)
        return node

    def update_graph_node(self, node_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing graph node."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")

        for i, node in enumerate(self._graph_array):
            if isinstance(node, dict) and node.get("id") == node_id:
                updated_node = dict(node)
                updated_node.update(updates)
                self._graph_array.pop(i)
                self._graph_array.insert(i, updated_node)
                return True
        return False

    def delete_graph_node(self, node_id: str) -> bool:
        """Delete a graph node by its ID."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")

        for i, node in enumerate(self._graph_array):
            if isinstance(node, dict) and node.get("id") == node_id:
                self._graph_array.pop(i)
                return True
        return False

    def get_graph_node_by_id(self, node_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific graph node by its ID."""
        nodes = self.get_graph_nodes()
        for node in nodes:
            if node.get("id") == node_id:
                return node
        return None

    def clear_graph(self):
        """Clear all nodes from the graph."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")

        length = len(self._graph_array)
        if length > 0:
            self._graph_array.clear()

    def set_graph_nodes(self, nodes: List[Dict[str, Any]]):
        """Replace all graph nodes with the provided list."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")

        self.clear_graph()
        for node in nodes:
            self._graph_array.append(node)

    def validate_graph_node(self, node: Dict[str, Any]) -> bool:
        """Validate a graph node structure."""
        required_fields = ["id", "name"]
        return all(field in node for field in required_fields)

    # Utility Methods
    def get_document_state(self) -> Dict[str, Any]:
        """Get the current state of all document structures."""
        if not self.is_connected:
            raise RuntimeError("Not connected to YDoc server")

        return {
            "xyz_text": self.get_xyz_text(),
            "messages": self.get_messages(),
            "graph_nodes": self.get_graph_nodes(),
            "is_connected": self.is_connected
        }

    def export_to_json(self, file_path: str):
        """Export the current document state to a JSON file."""
        state = self.get_document_state()
        with open(file_path, 'w') as f:
            json.dump(state, f, indent=2)

    def load_from_json(self, file_path: str):
        """Load document state from a JSON file."""
        with open(file_path, 'r') as f:
            state = json.load(f)

        if "xyz_text" in state:
            self.set_xyz_text(state["xyz_text"])

        if "messages" in state:
            self.clear_messages()
            for msg in state["messages"]:
                if isinstance(msg, dict) and all(k in msg for k in ["sender", "content"]):
                    self.add_message(msg["sender"], msg["content"])

        if "graph_nodes" in state:
            self.set_graph_nodes(state["graph_nodes"])


# Context manager for automatic connection handling
class GraphChatClient:
    """Context manager for GraphChatSDK with automatic connection handling."""

    def __init__(self, websocket_url: str = "http://localhost:3000", room_name: str = "room"):
        self.sdk = GraphChatSDK(websocket_url, room_name)

    async def __aenter__(self):
        await self.sdk.connect()
        return self.sdk

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.sdk.disconnect()
