import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
  age: number
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([
    { id: 1, name: '张三', age: 18 },
    { id: 2, name: '李四', age: 22 },
    { id: 3, name: '王五', age: 25 },
  ])

  const currentUser = ref<User | null>(null)

  const totalUsers = computed(() => users.value.length)
  const averageAge = computed(() => {
    if (users.value.length === 0) return 0
    const sum = users.value.reduce((acc, user) => acc + user.age, 0)
    return Math.round(sum / users.value.length)
  })

  const addUser = (user: Omit<User, 'id'>) => {
    const newId = users.value.length > 0 
      ? Math.max(...users.value.map(u => u.id)) + 1 
      : 1
    users.value.push({ ...user, id: newId })
  }

  const updateUser = (id: number, updates: { name?: string; age?: number }) => {
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updates } as User
    }
  }

  const deleteUser = (id: number) => {
    users.value = users.value.filter(u => u.id !== id)
    if (currentUser.value?.id === id) {
      currentUser.value = null
    }
  }

  const selectUser = (user: User) => {
    currentUser.value = user
  }

  const clearSelection = () => {
    currentUser.value = null
  }

  return {
    users,
    currentUser,
    totalUsers,
    averageAge,
    addUser,
    updateUser,
    deleteUser,
    selectUser,
    clearSelection,
  }
})