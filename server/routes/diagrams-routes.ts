import { Router } from "express";
import { db } from "../db";
import { diagrams, diagramComponents } from "../../shared/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

// Get all diagrams
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category, section, isActive } = req.query;
    
    let query = db.select().from(diagrams);
    
    // Apply filters
    const conditions = [];
    if (category) conditions.push(eq(diagrams.category, category as string));
    if (section) conditions.push(eq(diagrams.section, section as string));
    if (isActive !== undefined) conditions.push(eq(diagrams.isActive, isActive === 'true'));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const allDiagrams = await query
      .orderBy(asc(diagrams.orderIndex), desc(diagrams.createdAt));

    res.json(allDiagrams);
  } catch (error) {
    console.error("Error fetching diagrams:", error);
    res.status(500).json({ error: "Failed to fetch diagrams" });
  }
});

// Get single diagram with components
router.get("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const diagram = await db
      .select()
      .from(diagrams)
      .where(eq(diagrams.id, id))
      .limit(1);

    if (diagram.length === 0) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    // Get components for this diagram
    const components = await db
      .select()
      .from(diagramComponents)
      .where(eq(diagramComponents.diagramId, id))
      .orderBy(asc(diagramComponents.orderIndex));

    res.json({
      ...diagram[0],
      components
    });
  } catch (error) {
    console.error("Error fetching diagram:", error);
    res.status(500).json({ error: "Failed to fetch diagram" });
  }
});

// Create new diagram
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      section,
      content,
      orderIndex,
      isActive,
      icon,
      color,
      tags,
      keyPoints,
      relatedTopics
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !section) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newDiagram = await db
      .insert(diagrams)
      .values({
        title,
        description,
        category,
        section,
        content: content || {},
        orderIndex: orderIndex || 0,
        isActive: isActive !== undefined ? isActive : true,
        icon,
        color,
        tags: tags || [],
        keyPoints: keyPoints || [],
        relatedTopics: relatedTopics || [],
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(newDiagram[0]);
  } catch (error) {
    console.error("Error creating diagram:", error);
    res.status(500).json({ error: "Failed to create diagram" });
  }
});

// Update diagram
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      section,
      content,
      orderIndex,
      isActive,
      icon,
      color,
      tags,
      keyPoints,
      relatedTopics
    } = req.body;

    const updatedDiagram = await db
      .update(diagrams)
      .set({
        title,
        description,
        category,
        section,
        content,
        orderIndex,
        isActive,
        icon,
        color,
        tags,
        keyPoints,
        relatedTopics,
        updatedAt: new Date()
      })
      .where(eq(diagrams.id, id))
      .returning();

    if (updatedDiagram.length === 0) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    res.json(updatedDiagram[0]);
  } catch (error) {
    console.error("Error updating diagram:", error);
    res.status(500).json({ error: "Failed to update diagram" });
  }
});

// Delete diagram
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDiagram = await db
      .delete(diagrams)
      .where(eq(diagrams.id, id))
      .returning();

    if (deletedDiagram.length === 0) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    res.json({ message: "Diagram deleted successfully" });
  } catch (error) {
    console.error("Error deleting diagram:", error);
    res.status(500).json({ error: "Failed to delete diagram" });
  }
});

// Diagram Components Routes

// Get components for a diagram
router.get("/:id/components", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const components = await db
      .select()
      .from(diagramComponents)
      .where(eq(diagramComponents.diagramId, id))
      .orderBy(asc(diagramComponents.orderIndex));

    res.json(components);
  } catch (error) {
    console.error("Error fetching diagram components:", error);
    res.status(500).json({ error: "Failed to fetch diagram components" });
  }
});

// Create new component
router.post("/:id/components", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      title,
      content,
      orderIndex,
      isActive,
      backgroundColor,
      borderColor,
      textColor,
      metadata
    } = req.body;

    // Validate required fields
    if (!type || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newComponent = await db
      .insert(diagramComponents)
      .values({
        diagramId: id,
        type,
        title,
        content: content || {},
        orderIndex: orderIndex || 0,
        isActive: isActive !== undefined ? isActive : true,
        backgroundColor,
        borderColor,
        textColor,
        metadata: metadata || {},
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(newComponent[0]);
  } catch (error) {
    console.error("Error creating diagram component:", error);
    res.status(500).json({ error: "Failed to create diagram component" });
  }
});

// Update component
router.put("/components/:componentId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { componentId } = req.params;
    const {
      type,
      title,
      content,
      orderIndex,
      isActive,
      backgroundColor,
      borderColor,
      textColor,
      metadata
    } = req.body;

    const updatedComponent = await db
      .update(diagramComponents)
      .set({
        type,
        title,
        content,
        orderIndex,
        isActive,
        backgroundColor,
        borderColor,
        textColor,
        metadata,
        updatedAt: new Date()
      })
      .where(eq(diagramComponents.id, componentId))
      .returning();

    if (updatedComponent.length === 0) {
      return res.status(404).json({ error: "Component not found" });
    }

    res.json(updatedComponent[0]);
  } catch (error) {
    console.error("Error updating diagram component:", error);
    res.status(500).json({ error: "Failed to update diagram component" });
  }
});

// Delete component
router.delete("/components/:componentId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { componentId } = req.params;

    const deletedComponent = await db
      .delete(diagramComponents)
      .where(eq(diagramComponents.id, componentId))
      .returning();

    if (deletedComponent.length === 0) {
      return res.status(404).json({ error: "Component not found" });
    }

    res.json({ message: "Component deleted successfully" });
  } catch (error) {
    console.error("Error deleting diagram component:", error);
    res.status(500).json({ error: "Failed to delete diagram component" });
  }
});

// Get diagrams for public display (no auth required)
router.get("/public/:category", async (req, res) => {
  try {
    const { category } = req.params;

    const diagramsData = await db
      .select()
      .from(diagrams)
      .where(and(
        eq(diagrams.category, category),
        eq(diagrams.isActive, true)
      ))
      .orderBy(asc(diagrams.orderIndex));

    // Get components for each diagram
    const diagramsWithComponents = await Promise.all(
      diagramsData.map(async (diagram) => {
        const components = await db
          .select()
          .from(diagramComponents)
          .where(and(
            eq(diagramComponents.diagramId, diagram.id),
            eq(diagramComponents.isActive, true)
          ))
          .orderBy(asc(diagramComponents.orderIndex));

        return {
          ...diagram,
          components
        };
      })
    );

    res.json(diagramsWithComponents);
  } catch (error) {
    console.error("Error fetching public diagrams:", error);
    res.status(500).json({ error: "Failed to fetch diagrams" });
  }
});

export default router;
