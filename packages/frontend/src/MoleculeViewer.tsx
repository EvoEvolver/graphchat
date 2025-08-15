import {useEffect, useRef, useState} from 'react'
import * as $3Dmol from '3dmol'
import React from 'react'

function MoleculeViewer({xyz}) {
    const viewerRef = useRef(null)
    const [xyzContent, setXyzContent] = useState('')

    useEffect(() => {
        if (!xyz) return

        const updateContent = () => {
            setXyzContent(xyz.toString())
        }

        updateContent()
        xyz.observe(updateContent)

        return () => {
            xyz.unobserve(updateContent)
        }
    }, [xyz])

    useEffect(() => {
        if (viewerRef.current && xyzContent) {
            // Clear any existing viewer
            viewerRef.current.innerHTML = ''
            
            const viewer = $3Dmol.createViewer(viewerRef.current, {
                defaultcolors: $3Dmol.rasmolElementColors
            })

            viewer.addModel(xyzContent, 'xyz')
            viewer.setStyle({}, {stick: {radius: 0.2}, sphere: {scale: 0.3}})
            viewer.setBackgroundColor('#f8fafc', 0.8)
            viewer.zoomTo()
            viewer.render()
                //viewer.spin(true)
            
            // Ensure viewer resizes to fit container
            const resizeViewer = () => {
                if (viewer) {
                    viewer.resize()
                    viewer.render()
                }
            }
            
            // Add resize listener
            window.addEventListener('resize', resizeViewer)
            
            // Initial resize after a short delay to ensure container is properly sized
            setTimeout(resizeViewer, 100)
            
            return () => {
                window.removeEventListener('resize', resizeViewer)
            }
        }
    }, [xyzContent])

    return <>
        <div className="h-full">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex-shrink-0">
                Molecule Viewer
            </h2>
            <div
                ref={viewerRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '400px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                    borderRadius: '12px',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden'
                }}
            />
        </div>
    </>
}

export default MoleculeViewer