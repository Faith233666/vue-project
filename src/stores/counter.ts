import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('Pinia学习')

  const doubleCount = computed(() => count.value * 2)
  const tripleCount = computed(() => count.value * 3)

  const increment = () => {
    count.value++
  }

  const decrement = () => {
    count.value--
  }

  const reset = () => {
    count.value = 0
  }

  const incrementBy = (amount: number) => {
    count.value += amount
  }

  return {
    count,
    name,
    doubleCount,
    tripleCount,
    increment,
    decrement,
    reset,
    incrementBy,
  }
})