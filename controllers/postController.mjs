import connectDb from "../utils/db.mjs";

// POST --- add new post 
export const createPost = async (req, res) => {
  const newPost = req.body;

  try {
    const query = 
    `
    INSERT INTO posts (title, image, category_id, description, content, status_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
      newPost.title,
      newPost.image,
      newPost.category_id,
      newPost.description,
      newPost.content,
      newPost.status_id,
    ];

    await connectDb.query(query, values);
    return res.status(201).json({ message: "Created post successfully" });

  } catch(err) {
    console.error(err)
    return res.status(500).json({
      message: "Server could not create post because database connection",
    });
  }
};

// GET --- get all posts  
export const getAllPosts = async (req, res) => {
  try {
    const category = req.query.category || "";
    const keyword = req.query.keyword || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const offset = (safePage - 1) * safeLimit;

    let query = 
    `
      SELECT posts.id, posts.image, categories.name AS category, posts.title, posts.description, posts.date, posts.content, statuses.status, posts.likes_count
      FROM posts
      INNER JOIN categories ON posts.category_id = categories.id
      INNER JOIN statuses ON posts.status_id = statuses.id
    `;
    let values = [];

    if (category && keyword) {
      query += `
        WHERE categories.name ILIKE $1 
        AND (posts.title ILIKE $2 OR posts.description ILIKE $2 OR posts.content ILIKE $2)
      `;
      values = [`%${category}%`, `%${keyword}%`];
    } else if (category) {
      query += " WHERE categories.name ILIKE $1";
      values = [`%${category}%`];
    } else if (keyword) {
      query += `
        WHERE posts.title ILIKE $1 
        OR posts.description ILIKE $1 
        OR posts.content ILIKE $1
      `;
      values = [`%${keyword}%`];
    }

    query += ` ORDER BY posts.date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(safeLimit, offset);

    const result = await connectDb.query(query, values);

    //---------------------------- pagination ----------------------------
    let countQuery = 
    `
      SELECT COUNT(*)
      FROM posts
      INNER JOIN categories ON posts.category_id = categories.id
      INNER JOIN statuses ON posts.status_id = statuses.id
    `;
    let countValues = values.slice(0, -2);

    if (category && keyword) {
      countQuery += `
        WHERE categories.name ILIKE $1 
        AND (posts.title ILIKE $2 OR posts.description ILIKE $2 OR posts.content ILIKE $2)
      `;
    } else if (category) {
      countQuery += " WHERE categories.name ILIKE $1";
    } else if (keyword) {
      countQuery += `
        WHERE posts.title ILIKE $1 
        OR posts.description ILIKE $1 
        OR posts.content ILIKE $1
      `;
    }

    const countResult = await connectDb.query(countQuery, countValues);
    const totalPosts = parseInt(countResult.rows[0].count, 10);

    const results = {
      totalPosts,
      totalPages: Math.ceil(totalPosts / safeLimit),
      currentPage: safePage,
      limit: safeLimit,
      posts: result.rows,
    };
    if (offset + safeLimit < totalPosts) {
      results.nextPage = safePage + 1;
    }
    if (offset > 0) {
      results.previousPage = safePage - 1;
    }

    return res.status(200).json(results);
  } catch(err) {
    console.error(err)
    return res.status(500).json({
      message: "Server could not read post because database issue",
    });
  }
};

// GET --- get post by ID
export const getPostById = async (req, res) => {
  const postId = req.params.postId;

  try {
    const result = await connectDb.query(
      `
      SELECT posts.id, posts.image, categories.name AS category, posts.title, posts.description, posts.date, posts.content, statuses.status, posts.likes_count
      FROM posts
      INNER JOIN categories ON posts.category_id = categories.id
      INNER JOIN statuses ON posts.status_id = statuses.id
      WHERE posts.id = $1
      `,
      [postId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: `Post id: ${postId} not found` });
    }

    return res.status(200).json(result.rows[0]);
  } catch(err) {
    console.error(err)
    return res.status(500).json({
      message: "Server could not read post because database issue",
    });
  }
};

// PUT --- update post by ID
export const updatePost = async (req, res) => {
  const postId = req.params.postId;
  const updatedPost = { ...req.body, date: new Date() };

  try {
    const result = await connectDb.query(
      `
      UPDATE posts
      SET title = $2, image = $3, category_id = $4, description = $5, content = $6, status_id = $7, date = $8
      WHERE id = $1
      `,
      [
        postId,
        updatedPost.title,
        updatedPost.image,
        updatedPost.category_id,
        updatedPost.description,
        updatedPost.content,
        updatedPost.status_id,
        updatedPost.date,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Post not found (id: ${postId})` });
    }

    return res.status(200).json({ message: "Updated post successfully" });
  } catch(err) {
    console.error(err)
    return res.status(500).json({
      message: "Server could not update post because database connection",
    });
  }
};

// DELETE --- delete post by ID
export const deletePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    const result = await connectDb.query(
      `DELETE FROM posts WHERE id = $1`,
      [postId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Post id: ${postId} not found` });
    }

    return res.status(200).json({ message: "Deleted post successfully" });
  } catch(err) {
    console.error(err)
    return res.status(500).json({
      message: "Server could not delete post because database connection",
    });
  }
};