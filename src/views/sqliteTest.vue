<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get, post, put, del } from '../api/axios'
import { ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus'

interface User {
  id: number
  name: string
  age: number
}

const userList = ref<User[]>([])
const dialogVisible = ref(false)
const formData = ref<User>({ id: 0, name: '', age: 0 })
const formTitle = ref('新增用户')

const loadUsers = async () => {
  try {
    const response = await get<User[]>('/api/getUser')
    if (response.code === 200) {
      userList.value = response.data || []
    } else {
      ElMessage.error(response.msg || '获取用户列表失败')
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error(error)
  }
}

const openAddDialog = () => {
  formData.value = { id: 0, name: '', age: 0 }
  formTitle.value = '新增用户'
  dialogVisible.value = true
}

const openEditDialog = (user: User) => {
  formData.value = { ...user }
  formTitle.value = '编辑用户'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.value.name || formData.value.age <= 0) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    if (formData.value.id === 0) {
      const response = await post('/api/addUser', { name: formData.value.name, age: formData.value.age })
      if (response.code === 200) {
        ElMessage.success('新增成功')
        dialogVisible.value = false
        loadUsers()
      } else {
        ElMessage.error(response.msg || '新增失败')
      }
    } else {
      const response = await put('/api/editUser', { id: formData.value.id, name: formData.value.name, age: formData.value.age })
      if (response.code === 200) {
        ElMessage.success('修改成功')
        dialogVisible.value = false
        loadUsers()
      } else {
        ElMessage.error(response.msg || '修改失败')
      }
    }
  } catch (error) {
    ElMessage.error(formData.value.id === 0 ? '新增失败' : '修改失败')
    console.error(error)
  }
}

const handleDelete = async (id: number) => {
  try {
    const response = await del(`/api/delUser/${id}`)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadUsers()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    ElMessage.error('删除失败')
    console.error(error)
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="user-container">
    <header class="user-header">
      <h1 class="title">👥 用户管理</h1>
      <ElButton type="primary" @click="openAddDialog">新增用户</ElButton>
    </header>

    <div class="table-wrapper">
      <ElTable :data="userList" border>
        <ElTableColumn prop="id" label="ID" width="80" />
        <ElTableColumn prop="name" label="姓名" />
        <ElTableColumn prop="age" label="年龄" width="100" />
        <ElTableColumn label="操作" width="200">
          <template #default="{ row }">
            <ElButton type="primary" size="small" @click="openEditDialog(row as User)">编辑</ElButton>
            <ElButton type="danger" size="small" @click="handleDelete((row as User).id)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <ElDialog v-model="dialogVisible" :title="formTitle" width="400px">
      <ElForm :model="formData" label-width="80px">
        <ElFormItem label="姓名">
          <ElInput v-model="formData.name" placeholder="请输入姓名" />
        </ElFormItem>
        <ElFormItem label="年龄">
          <ElInput v-model.number="formData.age" placeholder="请输入年龄" type="number" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.user-container {
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px;
  background: #f5f5f5;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.title {
  font-size: 32px;
  color: #333;
  margin: 0;
  font-weight: 700;
}

.table-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
</style>