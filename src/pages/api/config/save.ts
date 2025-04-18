import type { APIRoute } from 'astro';
import { db, configs, users } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { githubConfig, giteaConfig, scheduleConfig } = body;

    if (!githubConfig || !giteaConfig || !scheduleConfig) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'All configuration sections are required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Preserve existing tokens if they're empty in the new config
    // This prevents tokens from being lost when the form is submitted with empty token fields
    try {
      const existingConfig = await db.select().from(configs).limit(1);
      if (existingConfig.length > 0) {
        const existing = existingConfig[0];

        // Parse existing configs
        const existingGithubConfig = typeof existing.githubConfig === 'string'
          ? JSON.parse(existing.githubConfig)
          : existing.githubConfig;

        const existingGiteaConfig = typeof existing.giteaConfig === 'string'
          ? JSON.parse(existing.giteaConfig)
          : existing.giteaConfig;

        // If new GitHub token is empty but we have an existing one, use the existing one
        if (!githubConfig.token && existingGithubConfig.token) {
          githubConfig.token = existingGithubConfig.token;
        }

        // If new Gitea token is empty but we have an existing one, use the existing one
        if (!giteaConfig.token && existingGiteaConfig.token) {
          giteaConfig.token = existingGiteaConfig.token;
        }
      }
    } catch (tokenError) {
      console.error('Error preserving existing tokens:', tokenError);
      // Continue with save operation even if token preservation fails
    }

    // Get the first user (for now, we'll associate the config with the first user)
    const firstUser = await db.select().from(users).limit(1);
    if (firstUser.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No users found in the database',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const userId = firstUser[0].id;

    // Check if a config already exists
    const existingConfig = await db.select().from(configs).limit(1);

    if (existingConfig.length > 0) {
      // Update existing config
      const configId = existingConfig[0].id;
      await db.update(configs)
        .set({
          githubConfig: JSON.stringify(githubConfig),
          giteaConfig: JSON.stringify(giteaConfig),
          scheduleConfig: JSON.stringify(scheduleConfig),
          updatedAt: Date.now(),
        })
        .where(db.eq(configs.id, configId));

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Configuration updated successfully',
          configId,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      // Create new config
      const configId = uuidv4();
      await db.insert(configs).values({
        id: configId,
        userId,
        name: 'Default Configuration',
        isActive: true,
        githubConfig: JSON.stringify(githubConfig),
        giteaConfig: JSON.stringify(giteaConfig),
        include: JSON.stringify(['*']),
        exclude: JSON.stringify([]),
        scheduleConfig: JSON.stringify(scheduleConfig),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Configuration created successfully',
          configId,
        }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error saving configuration:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: `Error saving configuration: ${error.message || 'Unknown error'}`,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
