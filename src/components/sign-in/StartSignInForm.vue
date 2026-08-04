<!--
StartSignInForm is responsible for:
1. UX for user to provide work email, and click sign-in.
2. Calling /api/sign-in/start
3. If the endpoint returns an error, showing that error.
4. Else, returning the response to SignInView via emit.
-->
<template>
  <div class="flex flex-row w-full justify-center pt-8">
    <Card class="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Sign in to your workspace</CardTitle>
        <CardDescription>
          Enter your workspace email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="start-sign-in-form" @submit="onSubmit">
          <FieldGroup>
            <!-- Email Input -->
            <VeeField v-slot="{ field, errors }" name="email">
              <Field :data-invalid="!!errors.length">
                <FieldLabel for="verification-email">
                  Email Address
                </FieldLabel>
                <Input
                  id="verification-email"
                  v-bind="field"
                  type="email"
                  placeholder="name@example.com"
                  autocomplete="email"
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
          <Button type="button" variant="outline" @click="resetForm">
            Reset
          </Button>
          <Button type="submit" form="start-sign-in-form">
            Get Code
          </Button>
        </Field>
        <FieldError v-if="errorMessage" :errors="[errorMessage]" />
      </CardFooter>
    </Card>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field as VeeField } from 'vee-validate'
import { z } from 'zod'

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

import type { SignInResponse } from '@/shared/sign-in/types'

const { initialEmail } = defineProps<{ initialEmail: string }>()
const emit = defineEmits<{
  success: [
    payload: {
      workspaceSlug: string
    }
  ],
  verify: [
    payload: {
      email: string
    }
  ]
}>()
const errorMessage = ref('')

const validationSchema = toTypedSchema(
  z.object({
    email: z.email('Please enter a valid email address.')
  })
)

const { handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues: {
    email: initialEmail
  }
})

const onSubmit = handleSubmit(async (data) => {
  errorMessage.value = ''

  try {
    const response = await fetch("http://localhost:4000/api/sign-in/start", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
        credentials: 'include'
    })

    const { status, workspaceSlug, error }: SignInResponse = await response.json()

    switch (status) {
      case 'signed-in':
        emit('success', { workspaceSlug: workspaceSlug! })
        break;

      case 'pending-verification':
        emit('verify', { email: data.email })
        break;

      case 'error':
        errorMessage.value = error!
        break;
    }

  } catch (e) {
    console.error(e)
    errorMessage.value = 'Something went wrong. Please try again.'
  }
})
</script>
