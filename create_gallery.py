#!/usr/bin/env python3
"""
Generate a 3D gallery room in Blender with artwork display setup.
This script creates walls, floor, pedestals, frames, and lighting.
"""

import bpy
import bmesh
from mathutils import Vector

# Clear existing mesh objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create materials
def create_material(name, color, roughness=0.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color[:3], 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    return mat

# Materials
wall_mat = create_material("WallMaterial", (0.9, 0.9, 0.9), 0.3)
floor_mat = create_material("FloorMaterial", (0.3, 0.25, 0.2), 0.6)
pedestal_mat = create_material("PedestalMaterial", (0.4, 0.4, 0.4), 0.4)
frame_mat = create_material("FrameMaterial", (0.8, 0.7, 0.5), 0.2)

def add_box(name, location, scale, material):
    """Create a box primitive"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(material)
    return obj

def add_light(name, light_type, location, energy=100):
    """Create a light source"""
    light_data = bpy.data.lights.new(name=name, type=light_type)
    light_data.energy = energy
    light_obj = bpy.data.objects.new(name, light_data)
    bpy.context.collection.objects.link(light_obj)
    light_obj.location = location
    return light_obj

# Room dimensions
room_width = 20
room_length = 30
room_height = 8
wall_thickness = 0.2

# Floor
add_box("Floor", (0, 0, -0.5), (room_width/2, room_length/2, 0.5), floor_mat)

# Walls
add_box("WallBack", (0, room_length/2, room_height/2), (room_width/2, wall_thickness/2, room_height/2), wall_mat)
add_box("WallFront", (0, -room_length/2, room_height/2), (room_width/2, wall_thickness/2, room_height/2), wall_mat)
add_box("WallLeft", (-room_width/2, 0, room_height/2), (wall_thickness/2, room_length/2, room_height/2), wall_mat)
add_box("WallRight", (room_width/2, 0, room_height/2), (wall_thickness/2, room_length/2, room_height/2), wall_mat)

# Ceiling
add_box("Ceiling", (0, 0, room_height + 0.5), (room_width/2, room_length/2, 0.5), wall_mat)

# Create pedestals for artwork (columns)
pedestal_positions = [
    (-6, -8, 0),
    (-6, 0, 0),
    (-6, 8, 0),
    (0, -8, 0),
    (0, 0, 0),
    (0, 8, 0),
    (6, -8, 0),
    (6, 0, 0),
    (6, 8, 0),
]

for i, pos in enumerate(pedestal_positions):
    add_box(f"Pedestal_{i}", pos, (1, 1, 3), pedestal_mat)

# Create picture frames on walls
frame_height = 3
frame_width = 2.5
frame_positions_wall = [
    (-room_width/2 + 1, -8, 4, "WallLeft"),
    (-room_width/2 + 1, 0, 4, "WallLeft"),
    (-room_width/2 + 1, 8, 4, "WallLeft"),
    (room_width/2 - 1, -8, 4, "WallRight"),
    (room_width/2 - 1, 0, 4, "WallRight"),
    (room_width/2 - 1, 8, 4, "WallRight"),
]

for i, (x, y, z, wall) in enumerate(frame_positions_wall):
    add_box(f"Frame_{i}", (x, y, z), (frame_width/2, 0.1, frame_height/2), frame_mat)

# Lighting setup
add_light("MainLight", "SUN", (5, 5, room_height - 1), energy=200)
add_light("FillLight", "SUN", (-5, -5, room_height - 2), energy=100)
add_light("SpotLight1", "SPOT", (0, 0, room_height - 0.5), energy=150)

# Set viewport shading to material for better preview
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for space in area.spaces:
            if space.type == 'VIEW_3D':
                space.shading.type = 'MATERIAL'

# Save the blend file
bpy.ops.wm.save_as_mainfile(filepath=r"C:\Users\yerie\Desktop\m3-hub-mvp\gallery_room.blend")

print("Gallery room created successfully!")
print("Saved to: C:\\Users\\yerie\\Desktop\\m3-hub-mvp\\gallery_room.blend")
