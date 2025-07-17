const userTokenAuth = async (req, res, next) => {
  const token = req.cookies.session_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const user = await User.findOne({ sessionToken: token });
  if (!user) return res.status(403).json({ message: 'Invalid session' });

  req.user = user; // now available in routes
  console.log('The Logged in User : ',user)
  next();
};

export default userTokenAuth