export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "GossipAI Backend API",
    version: "1.0.0",
    description: "JWT auth, gossips and conversation context APIs"
  },
  servers: [
    {
      url: "/api",
      description: "Current server"
    }
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Gossips" },
    { name: "Conversations" },
    { name: "ChatKit" }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Request validation failed." },
              fields: {
                type: "object",
                nullable: true,
                additionalProperties: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              details: { type: "object", nullable: true }
            },
            required: ["code", "message", "fields", "details"]
          }
        },
        required: ["success", "error"]
      },
      PublicUser: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Alper" },
          email: { type: "string", format: "email" },
          createdAt: { type: "string", format: "date-time" }
        },
        required: ["id", "name", "email", "createdAt"]
      },
      TokenPair: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" }
        },
        required: ["accessToken", "refreshToken"]
      },
      SessionInfo: {
        type: "object",
        properties: {
          sessionId: { type: "string", format: "uuid" },
          ipAddress: { type: "string", nullable: true },
          userAgent: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          lastUsedAt: { type: "string", format: "date-time" }
        },
        required: ["sessionId", "ipAddress", "userAgent", "createdAt", "lastUsedAt"]
      },
      ChatKitSession: {
        type: "object",
        properties: {
          sessionId: { type: "string", nullable: true },
          clientSecret: { type: "string", example: "cs_..." },
          expiresAt: { type: "string", format: "date-time", nullable: true },
          threadId: { type: "string", nullable: true }
        },
        required: ["sessionId", "clientSecret", "expiresAt", "threadId"]
      },
      DataChatKitSessionResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/ChatKitSession" }
        },
        required: ["data"]
      },
      ChatKitMessageRequest: {
        type: "object",
        properties: {
          content: { type: "string", minLength: 1, maxLength: 4000 },
          conversationId: { type: "string" },
          title: { type: "string", minLength: 1, maxLength: 120 },
          memoryMode: {
            type: "string",
            enum: ["off", "summary_only", "summary_plus_memory"]
          },
          mode: {
            type: "string",
            enum: ["HELP_ME_REPLY", "SITUATION_ANALYSIS", "HELP_ME_RESOLVE", "SUMMARIZE"],
            default: "HELP_ME_REPLY"
          },
          style: {
            type: "string",
            enum: ["FLIRTY", "SERIOUS", "CONFUSED"]
          },
          userGender: {
            type: "string",
            enum: ["female", "male", "nonbinary", "unspecified"]
          },
          targetGender: {
            type: "string",
            enum: ["female", "male", "nonbinary", "unspecified"]
          },
          relation: {
            type: "string",
            enum: ["dating", "friend", "family", "coworker", "boss", "client", "other"]
          },
          goal: { type: "string", minLength: 1, maxLength: 500 },
          toneLimits: { type: "string", minLength: 1, maxLength: 500 },
          context: { type: "string", minLength: 1, maxLength: 4000 },
          chatLog: { type: "string", minLength: 1, maxLength: 12000 }
        },
        required: ["content"]
      },
      ChatKitMessageResponse: {
        type: "object",
        properties: {
          conversationId: { type: "string" },
          assistant: {
            type: "object",
            properties: {
              id: { type: "string" },
              role: { type: "string", enum: ["assistant"] },
              content: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              tokensIn: { type: "number", nullable: true },
              tokensOut: { type: "number", nullable: true }
            },
            required: ["id", "role", "content", "createdAt", "tokensIn", "tokensOut"]
          },
          state: { $ref: "#/components/schemas/ConversationState" },
          summaryUpdated: { type: "boolean" }
        },
        required: ["conversationId", "assistant", "state", "summaryUpdated"]
      },
      DataChatKitMessageResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/ChatKitMessageResponse" }
        },
        required: ["data"]
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/PublicUser" },
          tokens: { $ref: "#/components/schemas/TokenPair" },
          session: { $ref: "#/components/schemas/SessionInfo" }
        },
        required: ["user", "tokens", "session"]
      },
      RegisterRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 }
        },
        required: ["name", "email", "password"]
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 }
        },
        required: ["email", "password"]
      },
      RefreshRequest: {
        type: "object",
        properties: {
          refreshToken: { type: "string", minLength: 1 }
        },
        required: ["refreshToken"]
      },
      MeResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/PublicUser" }
        },
        required: ["user"]
      },
      Gossip: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          content: { type: "string" },
          authorId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" }
        },
        required: ["id", "title", "content", "authorId", "createdAt"]
      },
      CreateGossipRequest: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 3 },
          content: { type: "string", minLength: 10 }
        },
        required: ["title", "content"]
      },
      GossipListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Gossip" }
          }
        },
        required: ["data"]
      },
      CreateGossipResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Gossip created" },
          data: { $ref: "#/components/schemas/Gossip" }
        },
        required: ["message", "data"]
      },
      FactItem: {
        type: "object",
        properties: {
          key: { type: "string" },
          value: { type: "string" },
          confidence: { type: "string", example: "low" }
        },
        required: ["key", "value", "confidence"]
      },
      OpenLoopItem: {
        type: "object",
        properties: {
          item: { type: "string" },
          priority: { type: "number" }
        },
        required: ["item"]
      },
      ConversationState: {
        type: "object",
        properties: {
          rollingSummary: { type: "string" },
          factsJson: {
            type: "array",
            items: { $ref: "#/components/schemas/FactItem" }
          },
          openLoopsJson: {
            type: "array",
            items: { $ref: "#/components/schemas/OpenLoopItem" }
          },
          safetyFlagsJson: { type: "object", additionalProperties: true },
          lastSummarizedMessageId: { type: "string", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true }
        },
        required: [
          "rollingSummary",
          "factsJson",
          "openLoopsJson",
          "safetyFlagsJson",
          "lastSummarizedMessageId",
          "updatedAt"
        ]
      },
      Conversation: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", nullable: true },
          status: { type: "string", enum: ["active", "archived", "deleted"] },
          memoryMode: { type: "string", enum: ["off", "summary_only", "summary_plus_memory"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          state: { $ref: "#/components/schemas/ConversationState" }
        },
        required: ["id", "status", "memoryMode", "createdAt", "updatedAt", "state"]
      },
      ConversationMessage: {
        type: "object",
        properties: {
          id: { type: "string" },
          role: { type: "string", enum: ["user", "assistant", "system"] },
          content: { type: "string" },
          createdAt: { type: "string", format: "date-time" }
        },
        required: ["id", "role", "content", "createdAt"]
      },
      ConversationDetail: {
        allOf: [
          { $ref: "#/components/schemas/Conversation" },
          {
            type: "object",
            properties: {
              messages: {
                type: "array",
                items: { $ref: "#/components/schemas/ConversationMessage" }
              }
            },
            required: ["messages"]
          }
        ]
      },
      ConversationListItem: {
        allOf: [
          { $ref: "#/components/schemas/Conversation" },
          {
            type: "object",
            properties: {
              messageCount: { type: "integer", minimum: 0 },
              lastMessage: {
                allOf: [{ $ref: "#/components/schemas/ConversationMessage" }],
                nullable: true
              }
            },
            required: ["messageCount", "lastMessage"]
          }
        ]
      },
      CreateConversationRequest: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 120 },
          memoryMode: {
            type: "string",
            enum: ["off", "summary_only", "summary_plus_memory"],
            default: "summary_only"
          }
        }
      },
      CreateConversationMessageRequest: {
        type: "object",
        properties: {
          content: { type: "string", minLength: 1, maxLength: 4000 }
        },
        required: ["content"]
      },
      UpdateConversationSettingsRequest: {
        type: "object",
        properties: {
          memoryMode: {
            type: "string",
            enum: ["off", "summary_only", "summary_plus_memory"]
          }
        },
        required: ["memoryMode"]
      },
      AddMessageResponse: {
        type: "object",
        properties: {
          assistant: {
            type: "object",
            properties: {
              id: { type: "string" },
              role: { type: "string", enum: ["assistant"] },
              content: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              tokensIn: { type: "number", nullable: true },
              tokensOut: { type: "number", nullable: true }
            },
            required: ["id", "role", "content", "createdAt", "tokensIn", "tokensOut"]
          },
          state: { $ref: "#/components/schemas/ConversationState" },
          summaryUpdated: { type: "boolean" }
        },
        required: ["assistant", "state", "summaryUpdated"]
      },
      DataConversationResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/Conversation" }
        },
        required: ["data"]
      },
      DataConversationDetailResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/ConversationDetail" }
        },
        required: ["data"]
      },
      DataConversationListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/ConversationListItem" }
          }
        },
        required: ["data"]
      },
      DataAddMessageResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/AddMessageResponse" }
        },
        required: ["data"]
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" }
                  },
                  required: ["status"]
                }
              }
            }
          }
        }
      }
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "User registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" }
              }
            }
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          409: {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" }
              }
            }
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh token pair",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "New access/refresh tokens",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" }
              }
            }
          },
          401: {
            description: "Invalid refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout refresh token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" }
            }
          }
        },
        responses: {
          204: {
            description: "Logged out"
          }
        }
      }
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Current user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/gossips": {
      get: {
        tags: ["Gossips"],
        summary: "List gossips",
        responses: {
          200: {
            description: "Gossip list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GossipListResponse" }
              }
            }
          }
        }
      },
      post: {
        tags: ["Gossips"],
        summary: "Create gossip",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateGossipRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateGossipResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/conversations": {
      get: {
        tags: ["Conversations"],
        summary: "List conversations for current user",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 50, default: 20 }
          }
        ],
        responses: {
          200: {
            description: "Conversation list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataConversationListResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      post: {
        tags: ["Conversations"],
        summary: "Create conversation",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateConversationRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataConversationResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/conversations/{id}": {
      get: {
        tags: ["Conversations"],
        summary: "Get conversation state and messages",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          },
          {
            name: "lastMessages",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 20, default: 8 }
          }
        ],
        responses: {
          200: {
            description: "Conversation detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataConversationDetailResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          404: {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Conversations"],
        summary: "Delete conversation",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          204: {
            description: "Deleted"
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          404: {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/conversations/{id}/messages": {
      post: {
        tags: ["Conversations"],
        summary: "Add user message and generate assistant response",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateConversationMessageRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Assistant response generated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataAddMessageResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          404: {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          409: {
            description: "Conversation not active",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/conversations/{id}/settings": {
      patch: {
        tags: ["Conversations"],
        summary: "Update conversation settings",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateConversationSettingsRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataConversationResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          404: {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/chatkit/sessions": {
      post: {
        tags: ["ChatKit"],
        summary: "Create ChatKit session for current user",
        security: [{ BearerAuth: [] }],
        responses: {
          201: {
            description: "Session created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataChatKitSessionResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          500: {
            description: "Workflow not configured",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          502: {
            description: "Upstream OpenAI error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/chatkit/conversations": {
      get: {
        tags: ["ChatKit"],
        summary: "List conversations for current user (ChatKit alias)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 50, default: 20 }
          }
        ],
        responses: {
          200: {
            description: "Conversation list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataConversationListResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/chatkit/conversations/{id}": {
      get: {
        tags: ["ChatKit"],
        summary: "Get conversation state and messages (ChatKit alias)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          },
          {
            name: "lastMessages",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 20, default: 8 }
          }
        ],
        responses: {
          200: {
            description: "Conversation detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataConversationDetailResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          404: {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/chatkit/messages": {
      post: {
        tags: ["ChatKit"],
        summary: "Send message via backend and return assistant response",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChatKitMessageRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Assistant response generated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DataChatKitMessageResponse" }
              }
            }
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          404: {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          409: {
            description: "Conversation not active",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          500: {
            description: "Workflow or SDK is not configured",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          502: {
            description: "Upstream OpenAI error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    }
  }
} as const;
