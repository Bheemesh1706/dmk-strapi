import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['admin::user'],
      async afterCreate(event) {
        const user = event.result as {
          email?: string;
          registrationToken?: string | null;
          isActive?: boolean;
        };

        // In CE, invited admin users are created with a registration token.
        if (!user?.email || !user.registrationToken || user.isActive) {
          return;
        }

        const adminAbsoluteUrl = strapi.config.get<string>('admin.absoluteUrl');
        const inviteUrl = `${adminAbsoluteUrl}/auth/register?registrationToken=${encodeURIComponent(user.registrationToken)}`;

        try {
          await strapi.plugin('email').service('email').send({
            to: user.email,
            from: process.env.SMTP_USERNAME,
            replyTo: process.env.SMTP_USERNAME,
            subject: 'You are invited to Strapi Admin',
            text: `You have been invited to access Strapi Admin. Complete your registration here: ${inviteUrl}`,
            html: `<p>You have been invited to access Strapi Admin.</p><p><a href="${inviteUrl}">Complete your registration</a></p>`,
          });
        } catch (error) {
          strapi.log.error('Failed to send admin invite email.');
          strapi.log.error(error);
        }
      },
    });
  },
};
