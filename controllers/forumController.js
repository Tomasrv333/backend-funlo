import Forum from '../models/forum.js';

export const createForum = async (req, res) => {
  const post = new Forum({ ...req.body, creatorId: req.user.id });
  await post.save();
  res.status(201).json(post);
};

export const getForum = async (req, res) => {
  const posts = await Forum.find().populate('creatorId', 'username');
  res.status(200).json(posts);
};