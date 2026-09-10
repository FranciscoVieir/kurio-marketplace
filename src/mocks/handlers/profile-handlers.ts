import {
  http,
  HttpResponse,
} from 'msw'

import type {
  ChangePasswordRequest,
  CollectorProfile,
  UpdateCollectorProfileRequest,
} from '@/features/profile/types/profile'

import {
  getProfileByUserId,
  updateProfile,
} from '@/mocks/database/profiles'

import {
  deleteSession,
  getActiveSession,
  isSessionExpired,
} from '@/mocks/database/sessions'

import {
  getUserByEmail,
  getUserById,
  getUserByUsername,
  updateUserIdentity,
  updateUserPassword,
  validateUserPassword,
} from '@/mocks/database/users'

function getAuthenticatedUser() {
  const session =
    getActiveSession()

  if (!session) {
    return {
      ok: false as const,

      response:
        HttpResponse.json(
          {
            code:
              'UNAUTHENTICATED',

            message:
              'Você precisa estar autenticado para acessar seu perfil.',
          },
          {
            status: 401,
          },
        ),
    }
  }

  if (
    isSessionExpired(
      session,
    )
  ) {
    deleteSession(
      session.id,
    )

    return {
      ok: false as const,

      response:
        HttpResponse.json(
          {
            code:
              'SESSION_EXPIRED',

            message:
              'Sua sessão expirou. Entre novamente.',
          },
          {
            status: 401,
          },
        ),
    }
  }

  const user =
    getUserById(
      session.userId,
    )

  if (!user) {
    deleteSession(
      session.id,
    )

    return {
      ok: false as const,

      response:
        HttpResponse.json(
          {
            code:
              'INVALID_SESSION',

            message:
              'A sessão atual não possui um usuário válido.',
          },
          {
            status: 401,
          },
        ),
    }
  }

  return {
    ok: true as const,

    user,
  }
}

function createCollectorProfile(
  user: {
    id: string
    displayName: string
    username: string
    email: string
  },
): CollectorProfile {
  const storedProfile =
    getProfileByUserId(
      user.id,
    )

  return {
    userId:
      user.id,

    displayName:
      user.displayName,

    username:
      user.username,

    email:
      user.email,

    ensName:
      storedProfile?.ensName,

    walletNickname:
      storedProfile?.walletNickname,

    avatar:
      storedProfile?.avatar,
  }
}

function isOptionalString(
  value: unknown,
) {
  return (
    value === undefined ||
    typeof value ===
      'string'
  )
}

function isUpdateProfileRequest(
  value: unknown,
): value is UpdateCollectorProfileRequest {
  if (
    typeof value !==
      'object' ||
    value === null
  ) {
    return false
  }

  const request =
    value as Record<
      string,
      unknown
    >

  return (
    typeof request.displayName ===
      'string' &&
    Boolean(
      request.displayName.trim(),
    ) &&

    typeof request.username ===
      'string' &&
    Boolean(
      request.username.trim(),
    ) &&

    typeof request.email ===
      'string' &&
    Boolean(
      request.email.trim(),
    ) &&

    isOptionalString(
      request.ensName,
    ) &&

    isOptionalString(
      request.walletNickname,
    ) &&

    isOptionalString(
      request.avatar,
    )
  )
}

function isChangePasswordRequest(
  value: unknown,
): value is ChangePasswordRequest {
  if (
    typeof value !==
      'object' ||
    value === null
  ) {
    return false
  }

  const request =
    value as Record<
      string,
      unknown
    >

  return (
    typeof request.currentPassword ===
      'string' &&
    Boolean(
      request.currentPassword,
    ) &&

    typeof request.newPassword ===
      'string' &&
    Boolean(
      request.newPassword,
    ) &&

    typeof request.confirmNewPassword ===
      'string' &&
    Boolean(
      request.confirmNewPassword,
    )
  )
}

export const profileHandlers = [
  /*
   * Retorna uma visão agregada:
   *
   * users + profile
   */
  http.get(
    '/api/me/profile',
    () => {
      const auth =
        getAuthenticatedUser()

      if (!auth.ok) {
        return auth.response
      }

      return HttpResponse.json(
        createCollectorProfile(
          auth.user,
        ),
        {
          status: 200,
        },
      )
    },
  ),

  /*
   * Atualiza identidade + dados
   * complementares do perfil.
   */
  http.patch(
    '/api/me/profile',
    async ({
      request,
    }) => {
      const auth =
        getAuthenticatedUser()

      if (!auth.ok) {
        return auth.response
      }

      const body: unknown =
        await request.json()

      if (
        !isUpdateProfileRequest(
          body,
        )
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_PROFILE_REQUEST',

            message:
              'Os dados enviados para o perfil são inválidos.',
          },
          {
            status: 400,
          },
        )
      }

      const username =
        body.username.trim()

      const email =
        body.email
          .trim()
          .toLowerCase()

      /*
       * Evita que a edição do perfil
       * tome o username de outra conta.
       */
      const userWithUsername =
        getUserByUsername(
          username,
        )

      if (
        userWithUsername &&
        userWithUsername.id !==
          auth.user.id
      ) {
        return HttpResponse.json(
          {
            code:
              'USERNAME_ALREADY_EXISTS',

            message:
              'Este nome de usuário já está em uso.',
          },
          {
            status: 409,
          },
        )
      }

      /*
       * Mesma proteção para e-mail.
       */
      const userWithEmail =
        getUserByEmail(
          email,
        )

      if (
        userWithEmail &&
        userWithEmail.id !==
          auth.user.id
      ) {
        return HttpResponse.json(
          {
            code:
              'EMAIL_ALREADY_EXISTS',

            message:
              'Já existe uma conta cadastrada com este e-mail.',
          },
          {
            status: 409,
          },
        )
      }

      const updatedUser =
        updateUserIdentity(
          auth.user.id,
          {
            displayName:
              body.displayName,

            username,

            email,
          },
        )

      if (!updatedUser) {
        return HttpResponse.json(
          {
            code:
              'USER_NOT_FOUND',

            message:
              'Usuário não encontrado.',
          },
          {
            status: 404,
          },
        )
      }

      updateProfile(
        auth.user.id,
        {
          ensName:
            body.ensName
              ?.trim() ||
            undefined,

          walletNickname:
            body.walletNickname
              ?.trim() ||
            undefined,

          avatar:
            body.avatar ||
            undefined,
        },
      )

      return HttpResponse.json(
        createCollectorProfile(
          updatedUser,
        ),
        {
          status: 200,
        },
      )
    },
  ),

  /*
   * Alteração de senha independente
   * do formulário de perfil.
   */
  http.patch(
    '/api/me/password',
    async ({
      request,
    }) => {
      const auth =
        getAuthenticatedUser()

      if (!auth.ok) {
        return auth.response
      }

      const body: unknown =
        await request.json()

      if (
        !isChangePasswordRequest(
          body,
        )
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_PASSWORD_REQUEST',

            message:
              'Preencha corretamente os campos de senha.',
          },
          {
            status: 400,
          },
        )
      }

      if (
        !validateUserPassword(
          auth.user.id,
          body.currentPassword,
        )
      ) {
        return HttpResponse.json(
          {
            code:
              'CURRENT_PASSWORD_INVALID',

            message:
              'A senha atual está incorreta.',
          },
          {
            status: 400,
          },
        )
      }

      if (
        body.newPassword.length <
        6
      ) {
        return HttpResponse.json(
          {
            code:
              'PASSWORD_TOO_SHORT',

            message:
              'A nova senha precisa ter pelo menos 6 caracteres.',
          },
          {
            status: 400,
          },
        )
      }

      if (
        body.newPassword !==
        body.confirmNewPassword
      ) {
        return HttpResponse.json(
          {
            code:
              'PASSWORDS_DO_NOT_MATCH',

            message:
              'A confirmação da nova senha não corresponde.',
          },
          {
            status: 400,
          },
        )
      }

      if (
        body.currentPassword ===
        body.newPassword
      ) {
        return HttpResponse.json(
          {
            code:
              'PASSWORD_NOT_CHANGED',

            message:
              'A nova senha precisa ser diferente da senha atual.',
          },
          {
            status: 400,
          },
        )
      }

      const updatedUser =
        updateUserPassword(
          auth.user.id,
          body.newPassword,
        )

      if (!updatedUser) {
        return HttpResponse.json(
          {
            code:
              'USER_NOT_FOUND',

            message:
              'Usuário não encontrado.',
          },
          {
            status: 404,
          },
        )
      }

      return new HttpResponse(
        null,
        {
          status: 204,
        },
      )
    },
  ),
]