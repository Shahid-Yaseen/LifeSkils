import { Router } from "express";
import { db } from "../db";
import { mapLocations, insertMapLocationSchema } from "../../shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Get all map locations (public endpoint)
router.get("/", async (req, res) => {
  try {
    const locations = await db
      .select()
      .from(mapLocations)
      .where(eq(mapLocations.isActive, true))
      .orderBy(desc(mapLocations.orderIndex), desc(mapLocations.createdAt));

    res.json(locations);
  } catch (error) {
    console.error("Error fetching map locations:", error);
    res.status(500).json({ error: "Failed to fetch map locations" });
  }
});

// Get map location by ID (public endpoint)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const location = await db
      .select()
      .from(mapLocations)
      .where(and(eq(mapLocations.id, id), eq(mapLocations.isActive, true)))
      .limit(1);

    if (location.length === 0) {
      return res.status(404).json({ error: "Map location not found" });
    }

    res.json(location[0]);
  } catch (error) {
    console.error("Error fetching map location:", error);
    res.status(500).json({ error: "Failed to fetch map location" });
  }
});

// Create new map location (admin only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const locationData = insertMapLocationSchema.parse(req.body);
    
    const newLocation = await db
      .insert(mapLocations)
      .values(locationData)
      .returning();

    res.status(201).json(newLocation[0]);
  } catch (error) {
    console.error("Error creating map location:", error);
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: "Invalid data provided", details: error.message });
    }
    res.status(500).json({ error: "Failed to create map location" });
  }
});

// Update map location (admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const updateData = insertMapLocationSchema.partial().parse(req.body);
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    const updatedLocation = await db
      .update(mapLocations)
      .set(updateData)
      .where(eq(mapLocations.id, id))
      .returning();

    if (updatedLocation.length === 0) {
      return res.status(404).json({ error: "Map location not found" });
    }

    res.json(updatedLocation[0]);
  } catch (error) {
    console.error("Error updating map location:", error);
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: "Invalid data provided", details: error.message });
    }
    res.status(500).json({ error: "Failed to update map location" });
  }
});

// Delete map location (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    
    // Soft delete by setting isActive to false
    const deletedLocation = await db
      .update(mapLocations)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(mapLocations.id, id))
      .returning();

    if (deletedLocation.length === 0) {
      return res.status(404).json({ error: "Map location not found" });
    }

    res.json({ message: "Map location deleted successfully" });
  } catch (error) {
    console.error("Error deleting map location:", error);
    res.status(500).json({ error: "Failed to delete map location" });
  }
});

// Bulk operations (admin only)
router.post("/bulk", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { operation, locations } = req.body;

    if (operation === 'import' && Array.isArray(locations)) {
      // Validate all locations
      const validatedLocations = locations.map(location => 
        insertMapLocationSchema.parse(location)
      );

      // Delete existing locations (soft delete)
      await db
        .update(mapLocations)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(mapLocations.isActive, true));

      // Insert new locations
      const newLocations = await db
        .insert(mapLocations)
        .values(validatedLocations)
        .returning();

      res.json({ 
        message: "Locations imported successfully", 
        count: newLocations.length,
        locations: newLocations 
      });
    } else {
      res.status(400).json({ error: "Invalid bulk operation" });
    }
  } catch (error) {
    console.error("Error in bulk operation:", error);
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: "Invalid data provided", details: error.message });
    }
    res.status(500).json({ error: "Failed to perform bulk operation" });
  }
});

export default router;
