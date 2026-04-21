#!/usr/bin/env python3
"""Export the gallery room to GLTF format"""

import bpy

# Open the blend file
bpy.ops.wm.open_mainfile(filepath=r"C:\Users\yerie\Desktop\m3-hub-mvp\gallery_room.blend")

# Export as GLTF (simplified)
bpy.ops.export_scene.gltf(
    filepath=r"C:\Users\yerie\Desktop\m3-hub-mvp\client\public\models\gallery_room.glb",
    export_format='GLB',
    export_lights=True
)

print("Gallery room exported to GLTF!")
print("File: C:\\Users\\yerie\\Desktop\\m3-hub-mvp\\client\\public\\models\\gallery_room.glb")
