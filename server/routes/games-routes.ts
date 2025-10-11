import { Router } from "express";
import { db } from "../db";
import { games } from "../../shared/schema";
import { eq, desc, asc } from "drizzle-orm";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

// Get all games
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const allGames = await db
      .select()
      .from(games)
      .orderBy(asc(games.orderIndex), desc(games.createdAt));

    res.json(allGames);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

// Get single game
router.get("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1);

    if (game.length === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json(game[0]);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

// Create new game
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      gameType,
      difficulty,
      isActive,
      orderIndex,
      instructions,
      estimatedTime,
      tags,
      gameData,
      // Game-specific data
      trueFalseQuestions,
      matchingPairs,
      tripleMatches,
      flipCards,
      aiTopics
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !gameType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newGame = await db
      .insert(games)
      .values({
        title,
        description,
        category,
        gameType,
        difficulty: difficulty || 'intermediate',
        isActive: isActive !== undefined ? isActive : true,
        orderIndex: orderIndex || 0,
        instructions,
        estimatedTime,
        tags: tags || [],
        gameData: gameData || {},
        // Game-specific data
        trueFalseQuestions: trueFalseQuestions || null,
        matchingPairs: matchingPairs || null,
        tripleMatches: tripleMatches || null,
        flipCards: flipCards || null,
        aiTopics: aiTopics || null,
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(newGame[0]);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ error: "Failed to create game" });
  }
});

// Update game
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      gameType,
      difficulty,
      isActive,
      orderIndex,
      instructions,
      estimatedTime,
      tags,
      gameData,
      // Game-specific data
      trueFalseQuestions,
      matchingPairs,
      tripleMatches,
      flipCards,
      aiTopics
    } = req.body;

    // Check if game exists
    const existingGame = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1);

    if (existingGame.length === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    const updatedGame = await db
      .update(games)
      .set({
        title,
        description,
        category,
        gameType,
        difficulty,
        isActive,
        orderIndex,
        instructions,
        estimatedTime,
        tags,
        gameData,
        // Game-specific data
        trueFalseQuestions: trueFalseQuestions !== undefined ? trueFalseQuestions : existingGame[0].trueFalseQuestions,
        matchingPairs: matchingPairs !== undefined ? matchingPairs : existingGame[0].matchingPairs,
        tripleMatches: tripleMatches !== undefined ? tripleMatches : existingGame[0].tripleMatches,
        flipCards: flipCards !== undefined ? flipCards : existingGame[0].flipCards,
        aiTopics: aiTopics !== undefined ? aiTopics : existingGame[0].aiTopics,
        updatedAt: new Date()
      })
      .where(eq(games.id, id))
      .returning();

    res.json(updatedGame[0]);
  } catch (error) {
    console.error("Error updating game:", error);
    res.status(500).json({ error: "Failed to update game" });
  }
});

// Delete game
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if game exists
    const existingGame = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1);

    if (existingGame.length === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    await db
      .delete(games)
      .where(eq(games.id, id));

    res.json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting game:", error);
    res.status(500).json({ error: "Failed to delete game" });
  }
});

// Toggle game status
router.patch("/:id/toggle", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get current game
    const currentGame = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1);

    if (currentGame.length === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    const updatedGame = await db
      .update(games)
      .set({
        isActive: !currentGame[0].isActive,
        updatedAt: new Date()
      })
      .where(eq(games.id, id))
      .returning();

    res.json(updatedGame[0]);
  } catch (error) {
    console.error("Error toggling game status:", error);
    res.status(500).json({ error: "Failed to toggle game status" });
  }
});

// Reorder games
router.patch("/reorder", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { gameOrders } = req.body; // Array of { id, orderIndex }

    if (!Array.isArray(gameOrders)) {
      return res.status(400).json({ error: "Invalid game orders format" });
    }

    // Update each game's order
    const updatePromises = gameOrders.map(({ id, orderIndex }) =>
      db
        .update(games)
        .set({
          orderIndex,
          updatedAt: new Date()
        })
        .where(eq(games.id, id))
    );

    await Promise.all(updatePromises);

    res.json({ message: "Games reordered successfully" });
  } catch (error) {
    console.error("Error reordering games:", error);
    res.status(500).json({ error: "Failed to reorder games" });
  }
});

export default router;
