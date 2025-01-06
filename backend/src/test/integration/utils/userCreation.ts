import { jwtService } from '../../../services/user/jwtService';
import { User } from '../../../models/User/user';
import { passwordService } from '../../../services/user/passwordService';
import { tokenService } from '../../../services/common/tokenService';
import { config } from '../../../config/config';
export const createAdminUser = async () => {
  const username = `${Date.now()}-${Math.floor(Math.random() * 100)}`;
  const password = `${Date.now()}-${Math.floor(Math.random() * 100)}`;
  const email =
    `${Date.now()}-${Math.floor(Math.random() * 100)}` + '@gmail.com';
  const passwordHash = await passwordService.hashPassword(password);
  const user = await User.create({
    email: email.toLowerCase(),
    password: passwordHash,
    username: username,
    isActive: true,
    role: 'ADMIN',
  });
  delete user.password;
  return { password: password, user: user };
};

export const createAdminToken = async ({
  userId,
  username,
  email,
  role,
  profileImg,
  phone,
  parentUserId,
  subRoleId,
}: any) => {
  const token = await jwtService.generateToken({
    userId: userId,
    username: username,
    email: email,
    role: role,
    profileImg: profileImg,
    phone: phone,
    parentUserId: parentUserId,
    subRoleId: subRoleId,
  });
  await tokenService.setToken(userId, token, config.authConfig.tokenExpiry);
  return token;
};

export const deleteUser = async (userId: string) => {
  const result = await User.destroy({
    where: {
      userId: userId,
    },
  });
  return result;
};
