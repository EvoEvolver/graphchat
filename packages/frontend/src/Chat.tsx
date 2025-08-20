import React from 'react'
import { useState, useEffect, useRef } from 'react'

function Chat({ yarray }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [senderName, setSenderName] = useState('You')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!yarray) return

    const updateMessages = () => {
      setMessages(yarray.toArray())
    }

    updateMessages()
    yarray.observe(updateMessages)

    return () => {
      yarray.unobserve(updateMessages)
    }
  }, [yarray])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (sender, content) => {
    if (!yarray) return
    
    const newMessage = {
      id: Date.now(),
      sender,
      content,
      date: new Date()
    }
    yarray.push([newMessage])
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      addMessage(senderName, `<p>${newMessage}</p>`)
      setNewMessage('')
    }
  }

  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex-shrink-0">
        Chat Messages
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200/50 min-h-0">
        {messages.sort((a, b) => new Date(a.date) - new Date(b.date)).map((message) => (
          <div
            key={message.id}
            className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-white/30 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-indigo-700">{message.sender}</span>
              <span className="text-xs text-gray-500">{formatDate(message.date)}</span>
            </div>
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 bg-white/90 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Send
        </button>
      </form>
      
      <div className="text-xs text-gray-400 text-center mt-2">
        {messages.length} message{messages.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

export default Chat