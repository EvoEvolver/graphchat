import {useEffect, useState} from 'react'
import * as Y from 'yjs'
import MoleculeViewer from './MoleculeViewer'
import Chat from './Chat'
import GraphVisualization from './GraphVisualization'
import React from 'react'
import {WebsocketProvider} from "y-websocket";

function App() {
    const [xyzText, setXyzText] = useState(null)
    const [graphArray, setGraphArray] = useState(null)
    const [messagesArray, setMessagesArray] = useState(null)

    const mockGraphData = [
        {
            id: "1",
            name: "Input Layer",
            out_node_id: ["2"],
            description: "Data preprocessing and feature extraction"
        },
        {
            id: "2",
            name: "Hidden Layer 1",
            in_node_id: "1",
            out_node_id: ["3"],
            description: "First neural network layer"
        },
        {
            id: "3",
            name: "Hidden Layer 2",
            in_node_id: "2",
            out_node_id: ["4"],
            description: "Second neural network layer"
        },
        {
            id: "4",
            name: "Output Layer",
            in_node_id: "3",
            description: "Final classification results"
        }
    ];

    useEffect(() => {
        const ydoc = new Y.Doc()
        const wsUrl = `http://localhost:3000`
        let wsProvider = new WebsocketProvider(wsUrl, "room", ydoc)

        const xyz = ydoc.getText('xyz')
        const messages = ydoc.getArray('messages')
        const graph = ydoc.getArray('graph')

        //xyz.insert(0, mockXyzData)
        //graph.insert(0, mockGraphData)

        setXyzText(xyz)
        setMessagesArray(messages)
        setGraphArray(graph)

        console.log('Y.Doc created with structures:', {xyz, messages, graph})
    }, [])

    const mockXyzData = `8
Caffeine partial structure
N   -0.520   1.410   0.000
C   -1.780   0.860   0.000
N   -1.780  -0.450   0.000
C   -0.520  -1.040   0.000
C    0.650  -0.280   0.000
C    0.650   1.020   0.000
N    1.900  -0.870   0.000
C    1.900  -2.200   0.000`;

    return (
        <div className="h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full h-full min-h-0">
                {/* Left Column - Molecule Viewer */}
                <div
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 h-full min-h-0 overflow-hidden">
                    <MoleculeViewer xyz={xyzText}/>
                </div>

                {/* Center Column - Larger */}
                <div
                    className="col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 h-full min-h-0 overflow-hidden">
                    <Chat yarray={messagesArray}/>
                </div>

                {/* Right Column - Graph Visualization */}
                <div
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 h-full min-h-0 overflow-hidden">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Graph
                        Visualization</h2>
                    <GraphVisualization yarray={graphArray}/>
                </div>
            </div>
        </div>
    )
}

export default App
