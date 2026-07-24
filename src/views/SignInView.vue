<template>
  sign in
</template>

<script setup lang="ts">
/*
How this page works:

The first stage is SOLICIT_EMAIL. The user is presented with an input
to enter his email. On clicking submit, the following will happen:

Call `/api/sign-in/start`.

If the user is already signed in, we get that info in the response.
The stage will change to SIGNED_IN and the user will be redirected
to his workspace.

If the user is not found, the API will state he's pending-verification,
and the stage will change to PENDING_VERIFICATION.

If the user is found, the API will state he's pending-verification,
and the stage will change to PENDING_VERIFICATION. The backend will
send the user the sign-in verification email with a 6-digit code.

When in PENDING_VERIFICATION..

The user can enter the requested code. This calls `/api/sign-in/verify`.
If the code was correct, the user is signed-in and redirected to his workspace.

If the code was incorrect, the stage changes to FAILED_VERIFICATION.
The user may try again, which takes him back to the SOLICIT_EMAIL stage.

If the user does not enter a code within 5 minutes, the stage changes to
VERIFICATION_TIMED_OUT. The user may try again, which takes him back to the
SOLICIT_EMAIL stage.
 */
</script>
