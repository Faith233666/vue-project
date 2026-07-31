export interface UserInfo {
  id: number
  username: string
  email: string
  avatar: string
  role: string
  createdAt: string
}

export interface LoginForm {
  username: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  code: number
  message: string
  data?: {
    token: string
    user: UserInfo
  }
}

// 模拟数据库初始化
const STORAGE_USERS_KEY = 'vue_project_mock_users'

const getStoredUsers = (): (RegisterForm & UserInfo)[] => {
  const data = localStorage.getItem(STORAGE_USERS_KEY)
  if (!data) {
    // 预置初始测试账号
    const initialUsers = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: '123456',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        role: '管理员',
        createdAt: new Date().toLocaleDateString(),
      },
      {
        id: 2,
        username: 'vue_user',
        email: 'user@example.com',
        password: '123456',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VueUser',
        role: '普通用户',
        createdAt: new Date().toLocaleDateString(),
      },
    ]
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initialUsers))
    return initialUsers
  }
  return JSON.parse(data)
}

/**
 * 模拟登录 API
 */
export const loginApi = (form: LoginForm): Promise<AuthResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getStoredUsers()
      const found = users.find(
        (u) => (u.username === form.username || u.email === form.username) && u.password === form.password
      )

      if (found) {
        const token = `token_mock_${found.id}_${Date.now()}`
        const { password, ...userInfo } = found
        resolve({
          code: 200,
          message: '登录成功！',
          data: {
            token,
            user: userInfo,
          },
        })
      } else {
        resolve({
          code: 401,
          message: '用户名或密码错误，请重试！',
        })
      }
    }, 600)
  })
}

/**
 * 模拟注册 API
 */
export const registerApi = (form: RegisterForm): Promise<AuthResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getStoredUsers()
      const existName = users.some((u) => u.username === form.username)
      if (existName) {
        return resolve({
          code: 400,
          message: '该用户名已被使用，请换一个名称！',
        })
      }

      const existEmail = users.some((u) => u.email === form.email)
      if (existEmail) {
        return resolve({
          code: 400,
          message: '该邮箱已被注册！',
        })
      }

      const newUser = {
        id: Date.now(),
        username: form.username,
        email: form.email,
        password: form.password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(form.username)}`,
        role: '普通用户',
        createdAt: new Date().toLocaleDateString(),
      }

      users.push(newUser)
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users))

      const token = `token_mock_${newUser.id}_${Date.now()}`
      const { password, ...userInfo } = newUser

      resolve({
        code: 200,
        message: '注册成功并已自动登录！',
        data: {
          token,
          user: userInfo,
        },
      })
    }, 800)
  })
}

/**
 * 模拟获取用户信息 API
 */
export const getUserInfoApi = (token: string): Promise<UserInfo | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!token || !token.startsWith('token_mock_')) {
        return resolve(null)
      }
      const parts = token.split('_')
      const userId = Number(parts[2])
      const users = getStoredUsers()
      const found = users.find((u) => u.id === userId)
      if (found) {
        const { password, ...userInfo } = found
        resolve(userInfo)
      } else {
        resolve(null)
      }
    }, 300)
  })
}
