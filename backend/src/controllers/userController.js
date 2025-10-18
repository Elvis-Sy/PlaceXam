import { UserService } from "../services/userService.js";

export const createUser = async (req, res) => {
  try {
    const result = await UserService.createUser(req.body);
    res.status(201).json({ 
        message: "Utilisateur créé avec succès", 
        data: result 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const adminId = req.user.id;
    const result = await UserService.getAllUsers(adminId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const result = await UserService.getUserById(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await UserService.updateUser(id, req.body);
    res.status(200).json({ 
        message: "Utilisateur mis à jour avec succès", 
        data: result 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await UserService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const result = await UserService.updateProfile(id, req.body);
    res.status(200).json({ 
        message: "Profile mis à jour avec succès", 
        data: result 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
