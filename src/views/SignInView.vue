<!--
SignInView coordinates the display of StartSignInForm and VerifySignInForm.
Initially, StartSignInForm is shown. After the user submits his email,
If the user is already signed in with that email, then SignInView redirects
the user to his workspace.

If the user needs to verify his sign-in, he is shown the VerifySignInForm.

If the user provides the verification code in time, SignInView redirects
the user to his workspace.

If the verification code is wrong or not provided in time, then the user
has can try again, which triggers SignInView to show StartSignInForm.
-->
<template>
  <StartSignInForm
    v-if="!inVerification"
    :initial-email="email"
    @success="handleSuccessfulSignIn"
    @verify="handlePendingVerification"
  />
  <VerifySignInForm
    v-else
    :email="email"
    @success="handleSuccessfulSignIn"
    @restart="handleRestart"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import StartSignInForm from '@/components/sign-in/StartSignInForm.vue'
import VerifySignInForm from '@/components/sign-in/VerifySignInForm.vue'

const email = ref('')
const router = useRouter()
const inVerification = ref(false)

function handlePendingVerification({ email: submittedEmail }: { email: string }) {
  email.value = submittedEmail
  inVerification.value = true
}

function handleSuccessfulSignIn({ workspaceSlug }: { workspaceSlug: string }) {
  console.log(`going to /${workspaceSlug}`)
  router.push({ name: 'inbox', params: { workspaceSlug } })
}

function handleRestart() {
  inVerification.value = false
}
</script>

