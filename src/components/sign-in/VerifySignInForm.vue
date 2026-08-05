<template>
  <div class="flex flex-row w-full justify-center pt-8">
    <Card class="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Sign in to your workspace</CardTitle>
        <CardDescription>
          Enter the 6-digit verification code sent to {{ email }} by {{ deadline }}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="verify-sign-in-form" @submit="onSubmit">
          <FieldGroup>
            <!-- 6-Digit Code Input -->
            <VeeField v-slot="{ field, errors }" name="code">
              <Field :data-invalid="!!errors.length">
                <FieldLabel for="verification-code">
                  Verification Code
                </FieldLabel>
                <Input
                  id="verification-code"
                  v-bind="field"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  placeholder="123456"
                  autocomplete="one-time-code"
                  class="tracking-widest font-mono"
                  :aria-invalid="!!errors.length"
                />
                <FieldError v-if="errors.length" :errors="errors" />
              </Field>
            </VeeField>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" @click="handleRestart">
            Start Over
          </Button>
          <Button type="submit" form="verify-sign-in-form">
            Verify
          </Button>
        </Field>
        <FieldError v-if="errorMessage" :errors="[errorMessage]" />
      </CardFooter>
    </Card>
  </div>

</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field as VeeField } from 'vee-validate'
import { z } from 'zod'
import { apiFetch } from '@/api/client'
import type { SignInResponse } from '@/shared/sign-in/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const { email } = defineProps<{ email: string }>()
const emit = defineEmits<{
  success: [
    payload: {
      workspaceSlug: string;
    }
  ],
  restart: []
}>()
const errorMessage = ref('')
const deadline = ref('')
onBeforeMount(() => {
  const t = new Date(Date.now() + 5 * 60 * 1000)
  // Formats to "11:01 AM" (or 24-hour equivalent depending on locale)
  deadline.value = t.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const validationSchema = toTypedSchema(
  z.object({
    code: z
      .string()
      .min(1, 'Verification code is required.')
      .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits.'),
  })
)

const { handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    code: ''
  }
})

const onSubmit = handleSubmit(async (data) => {
  errorMessage.value = ''

  try {
      const { status, workspaceSlug, error } = await apiFetch<SignInResponse>('/api/sign-in/verify', {
          method: 'POST',
          body: JSON.stringify({ email, code: data.code })
      })

      switch (status) {
        case 'signed-in':
          emit('success', { workspaceSlug: workspaceSlug! })
          break;

        case 'error':
          errorMessage.value = error!
          break;
      }
  } catch {
      errorMessage.value = 'Something went wrong. Please try again.'
  }
})

function handleRestart() {
  errorMessage.value = ''

  emit('restart')
}
</script>
