import {
  toggleFollow as toggleFollowService,
  getFollowStatus as getFollowStatusService,
  getFollowCounts as getFollowCountsService,
} from "../services/follow.service.js";

export const toggleFollow = async (req, res, next) => {
  try {
    const result = await toggleFollowService(req.user.id, req.params.username);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getFollowStatus = async (req, res, next) => {
  try {
    const result = await getFollowStatusService(
      req.user.id,
      req.params.username,
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getFollowCounts = async (req, res, next) => {
  try {
    const result = await getFollowCountsService(req.params.username);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
