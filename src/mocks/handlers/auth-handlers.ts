import {
  http,
  HttpResponse,
} from 'msw'

import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@/features/auth/types/auth'

import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  toPublicUser,
  validateUserCredentials,
} from '@/mocks/database/users'

import {
  clearActiveSession,
  createSession,
  deleteSession,
  getActiveSession,
  isSessionExpired,
} from '@/mocks/database/sessions'

function isLoginRequest(
  value: unknown,
): value is LoginRequest {
  if (
    typeof value !== 'object' ||
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
    typeof request.email ===
      'string' &&
    Boolean(
      request.email.trim(),
    ) &&
    typeof request.password ===
      'string' &&
    Boolean(
      request.password,
    )
  )
}

function isRegisterRequest(
  value: unknown,
): value is RegisterRequest {
  if (
    typeof value !== 'object' ||
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
    typeof request.password ===
      'string' &&
    Boolean(
      request.password,
    ) &&
    typeof request.confirmPassword ===
      'string' &&
    Boolean(
      request.confirmPassword,
    )
  )
}

export const authHandlers = [
  http.post(
    '/api/auth/register',
    async ({ request }) => {
      const body: unknown =
        await request.json()

      if (
        !isRegisterRequest(body)
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_REGISTER_REQUEST',
            message:
              'Os dados enviados para o cadastro são inválidos.',
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

      if (
        body.password.length < 6
      ) {
        return HttpResponse.json(
          {
            code:
              'PASSWORD_TOO_SHORT',
            message:
              'A senha precisa ter pelo menos 6 caracteres.',
          },
          {
            status: 400,
          },
        )
      }

      if (
        body.password !==
        body.confirmPassword
      ) {
        return HttpResponse.json(
          {
            code:
              'PASSWORDS_DO_NOT_MATCH',
            message:
              'As senhas informadas não são iguais.',
          },
          {
            status: 400,
          },
        )
      }

      if (
        getUserByEmail(email)
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

      if (
        getUserByUsername(
          username,
        )
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

      const storedUser =
        createUser({
          username,
          email,
          password:
            body.password,
          confirmPassword:
            body.confirmPassword,
        })

      const session =
        createSession(
          storedUser.id,
        )

      const response: AuthResponse =
        {
          user:
            toPublicUser(
              storedUser,
            ),

          session,
        }

      return HttpResponse.json(
        response,
        {
          status: 201,
        },
      )
    },
  ),

  http.post(
    '/api/auth/login',
    async ({ request }) => {
      const body: unknown =
        await request.json()

      if (
        !isLoginRequest(body)
      ) {
        return HttpResponse.json(
          {
            code:
              'INVALID_LOGIN_REQUEST',
            message:
              'E-mail e senha são obrigatórios.',
          },
          {
            status: 400,
          },
        )
      }

      const storedUser =
        validateUserCredentials(
          body.email,
          body.password,
        )

      if (!storedUser) {
        return HttpResponse.json(
          {
            code:
              'INVALID_CREDENTIALS',
            message:
              'E-mail ou senha inválidos.',
          },
          {
            status: 401,
          },
        )
      }

      const currentSession =
        getActiveSession()

      if (currentSession) {
        deleteSession(
          currentSession.id,
        )
      }

      const session =
        createSession(
          storedUser.id,
        )

      const response: AuthResponse =
        {
          user:
            toPublicUser(
              storedUser,
            ),

          session,
        }

      return HttpResponse.json(
        response,
        {
          status: 200,
        },
      )
    },
  ),

  http.get(
    '/api/auth/session',
    () => {
      const session =
        getActiveSession()

      if (!session) {
        return HttpResponse.json(
          {
            code:
              'UNAUTHENTICATED',
            message:
              'Nenhuma sessão ativa.',
          },
          {
            status: 401,
          },
        )
      }

      if (
        isSessionExpired(
          session,
        )
      ) {
        deleteSession(
          session.id,
        )

        return HttpResponse.json(
          {
            code:
              'SESSION_EXPIRED',
            message:
              'Sua sessão expirou.',
          },
          {
            status: 401,
          },
        )
      }

      const storedUser =
        getUserById(
          session.userId,
        )

      if (!storedUser) {
        deleteSession(
          session.id,
        )

        return HttpResponse.json(
          {
            code:
              'USER_NOT_FOUND',
            message:
              'O usuário associado à sessão não foi encontrado.',
          },
          {
            status: 401,
          },
        )
      }

      const response: AuthResponse =
        {
          user:
            toPublicUser(
              storedUser,
            ),

          session,
        }

      return HttpResponse.json(
        response,
        {
          status: 200,
        },
      )
    },
  ),

  http.post(
    '/api/auth/logout',
    () => {
      const session =
        getActiveSession()

      if (session) {
        deleteSession(
          session.id,
        )
      } else {
        clearActiveSession()
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