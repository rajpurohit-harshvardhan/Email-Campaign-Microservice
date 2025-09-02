function makeBuildEmailFromTemplate({Joi, ValidationError}) {
    return function buildEmailFromTemplate({linkname, userId, campaign, template, recipient}) {
        validateInput({linkname, userId, campaign, template, recipient});

        /**
         * - Template fields (subject, from, html/text, default_vars)
         * - Campaign overrides (subject/from/optional html/text, campaign_vars)
         * - Recipient variables (highest precedence)
         *
         * @param {object} campaign Row from `campaigns`
         * @param {object} template Row from `campaign_templates`
         * @param {object} recipient Row from `campaign_recipients`
         * @returns {object} emailObj for sendEmail job
         */
        // 1) Decide fields with campaign overrides first
        const subjectRaw = campaign.subject || template.subject || '';
        const fromEmail = campaign.fromEmail || template.fromEmail;
        const fromName  = (campaign.fromName ?? template.fromName) || undefined;

        // Optional HTML/Text overrides at the campaign level (keep if you add these columns)
        const htmlRaw = template.html || '';
        const textRaw = template.text || '';

        // 2) Merge variables with correct precedence:
        // recipient.variables > template.default_vars
        const templateDefaults = template.defaultVars || {};
        const recipientVars    = recipient.variables || {};

        // Provide a few convenience values users often expect
        const baseVars = {
            recipient: {
                email: recipient.email_address,
                name: recipient.name || '',
            },
            campaign: {
                id: campaign.id,
                name: campaign.name,
                linkname,
            },
            template: {
                id: template.id,
                linkname,
                name: template.name,
            },
        };

        const vars = deepMerge(templateDefaults, baseVars, recipientVars);

        // 3) Render all template strings
        const subject = renderTemplate(subjectRaw, vars);
        const html    = renderTemplate(htmlRaw, vars);
        const text    = textRaw ? renderTemplate(textRaw, vars) : stripHtml(html);

        // 4) Build the email object your single-email job expects
        return {
            // Headers / addressing
            to: [{email: recipient.email_address, name: recipient.name || vars.firstName || undefined}],
            from: {email: fromEmail, name: fromName},
            replyTo: fromEmail,

            // Content
            subject,
            body: {
                contentType: 'html/text',
                content: html,
                text,
            },

            // Useful metadata (for logs/webhooks)
            metadata: {
                campaignId: campaign.id,
                campaignRecipientId: recipient.id,
                templateId: template.id,
                linkname: campaign.linkname,
            },
        };
    };

    function validateInput({linkname, userId, campaign, template, recipient}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            campaign: Joi.object().unknown(true),
            template: Joi.object().unknown(true),
            recipient: Joi.object().unknown(true)
        });
        const {value, error} = schema.validate({linkname, userId, campaign, template, recipient});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }

    function get(obj, path) {
        return path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
    }

    function renderTemplate(str, vars) {
        if (!str) return '';
        return str.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
            const v = get(vars, key);
            // Convert non-string primitives safely
            if (v === null || v === undefined) return '';
            return String(v);
        });
    }

    function stripHtml(html) {
        return String(html || '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<\/(p|div|br|li|h[1-6])>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function deepMerge(...objs) {
        const out = {};
        for (const o of objs) {
            if (!o || typeof o !== 'object') continue;
            for (const k of Object.keys(o)) {
                const v = o[k];
                if (v && typeof v === 'object' && !Array.isArray(v)) {
                    out[k] = deepMerge(out[k] || {}, v);
                } else {
                    out[k] = v;
                }
            }
        }
        return out;
    }
}

module.exports = makeBuildEmailFromTemplate;
