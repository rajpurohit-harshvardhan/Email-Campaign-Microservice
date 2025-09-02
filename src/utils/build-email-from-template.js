// buildEmailFromTemplate.js

function get(obj, path) {
    return path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
}

export function renderTemplate(str, vars) {
    if (!str) return '';
    return str.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
        const v = get(vars, key);
        if (v === null || v === undefined) return '';
        return String(v);
    });
}

export function stripHtml(html) {
    return String(html || '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<\/(p|div|br|li|h[1-6])>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

export function deepMerge(...objs) {
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

export function buildEmailFromTemplate(campaign, template, recipient) {
    const subjectRaw = campaign.subject || template.subject || '';
    const fromEmail = campaign.from_email || template.from_email;
    const fromName  = (campaign.from_name ?? template.from_name) || undefined;

    const htmlRaw = campaign.html_content || template.html_content || '';
    const textRaw = campaign.text_content || template.text_content || '';

    const templateDefaults = template.default_vars || {};
    const campaignVars     = campaign.variables || {};
    const recipientVars    = recipient.variables || {};

    const baseVars = {
        recipient: {
            email: recipient.email_address,
            name: recipient.name || '',
        },
        campaign: {
            id: campaign.id,
            name: campaign.name,
            linkname: campaign.linkname,
        },
        template: {
            id: template.id,
            linkname: template.linkname,
            name: template.name,
        },
    };

    const vars = deepMerge(templateDefaults, campaignVars, baseVars, recipientVars);

    const subject = renderTemplate(subjectRaw, vars);
    const html    = renderTemplate(htmlRaw, vars);
    const text    = textRaw ? renderTemplate(textRaw, vars) : stripHtml(html);

    return {
        to: { email: recipient.email_address, name: recipient.name || vars.first_name || undefined },
        from: { email: fromEmail, name: fromName },
        subject,
        html,
        text,
        metadata: {
            campaignId: campaign.id,
            campaignRecipientId: recipient.id,
            templateId: template.id,
            linkname: campaign.linkname,
        },
    };
}
