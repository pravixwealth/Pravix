import { requireAdmin } from "@/lib/admin/server-auth";

export default async function AdminGuidePage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#0f172a]">Admin Panel Guide</h1>
        <p className="mt-2 text-base text-[#64748b]">
          Everything you need to know about managing the Pravix website. No technical knowledge required.
        </p>
      </div>

      {/* Quick Overview */}
      <Section title="📋 Quick Overview" id="overview">
        <p>The Pravix Admin Panel lets you manage your entire website without writing code. You can:</p>
        <ul className="mt-3 space-y-2">
          <li>✅ Create, edit, and publish blog posts</li>
          <li>✅ Upload and manage images</li>
          <li>✅ Change website navigation (header & footer links)</li>
          <li>✅ Update company info, contact details, and social links</li>
          <li>✅ View registered users and export their data</li>
          <li>✅ Track all admin activity via audit logs</li>
        </ul>
      </Section>

      {/* Sidebar Navigation */}
      <Section title="🧭 Sidebar Menu" id="sidebar">
        <Table headers={["Icon", "Menu Item", "What It Does"]}>
          <Row cells={["📊", "Dashboard", "Overview of platform stats — total users, blog posts, media files, recent activity"]} />
          <Row cells={["👥", "Users", "View all registered users, their financial profiles, goals, and export data as CSV"]} />
          <Row cells={["📖", "Admin Guide", "This page — instructions for using the admin panel"]} />
          <Row cells={["📝", "Blog", "Create, edit, publish, and delete blog articles"]} />
          <Row cells={["🖼️", "Media", "Upload, view, copy URLs, and delete images used across the website"]} />
          <Row cells={["🌐", "Navigation", "Manage header and footer menu links — add, edit, hide, or remove"]} />
          <Row cells={["📄", "Site Content", "Edit footer text, descriptions, CTAs, and marketing copy"]} />
          <Row cells={["⚙️", "Settings", "Company name, branding, contact info, SEO defaults, analytics, social links"]} />
          <Row cells={["🛡️", "Audit Logs", "See who did what and when — tracks all admin actions"]} />
        </Table>
      </Section>

      {/* Blog Section */}
      <Section title="📝 Blog — Creating & Publishing Articles" id="blog">
        <h4 className="mt-4 font-semibold text-[#0f172a]">Creating a New Post</h4>
        <ol className="mt-2 space-y-2 list-decimal pl-5">
          <li>Click <strong>Blog</strong> in the sidebar</li>
          <li>Click the blue <strong>+ New Post</strong> button</li>
          <li>Fill in the title (URL slug auto-generates)</li>
          <li>Select an author and category</li>
          <li>Upload a featured image (shown as the blog thumbnail)</li>
          <li>Write your content using the rich text editor</li>
          <li>Fill in SEO fields (focus keyword, meta title, meta description)</li>
          <li>Click <strong>Publish</strong> in the right sidebar</li>
        </ol>

        <h4 className="mt-6 font-semibold text-[#0f172a]">Editor Toolbar Guide</h4>
        <Table headers={["Button", "Name", "When to Use"]}>
          <Row cells={["B", "Bold", "Make important words or numbers stand out"]} />
          <Row cells={["I", "Italic", "Subtle emphasis for terms, book titles, or soft highlights"]} />
          <Row cells={["H2", "Section Heading", "Main section titles. Google uses these for SEO. Creates Table of Contents."]} />
          <Row cells={["H3", "Sub-heading", "Smaller sections within a main section. Improves scanning."]} />
          <Row cells={["≡", "Bullet List", "Unordered list for features, benefits, or non-sequential items"]} />
          <Row cells={["1.", "Numbered List", "Ordered steps, rankings, or instructions in sequence"]} />
          <Row cells={["❝", "Quote Block", "Highlight an expert quote, statistic, or source citation"]} />
          <Row cells={["—", "Divider", "Visual line separator between topics"]} />
          <Row cells={["🔗", "Link", "Add clickable links. Great for internal linking (boosts SEO)"]} />
          <Row cells={["🖼️", "Image", "Insert image from Media Library into the article"]} />
          <Row cells={["ℹ️", "Info Box", "Blue box — highlight key facts or definitions readers shouldn't miss"]} />
          <Row cells={["⚠️", "Warning Box", "Amber box — alert about mistakes, risks, or things to avoid"]} />
          <Row cells={["💡", "Tip Box", "Green box — share expert advice or insider tips"]} />
          <Row cells={["↶", "Undo", "Reverse last change (Ctrl+Z)"]} />
          <Row cells={["↷", "Redo", "Bring back undone change (Ctrl+Y)"]} />
        </Table>

        <h4 className="mt-6 font-semibold text-[#0f172a]">SEO Sidebar (Right Panel)</h4>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li><strong>SEO Score (0-100)</strong> — Live score based on 14 checks. Aim for 80+.</li>
          <li><strong>Focus Keyword</strong> — The main search term you want this post to rank for.</li>
          <li><strong>Meta Title</strong> — What shows in Google search results. Keep under 60 characters.</li>
          <li><strong>Meta Description</strong> — Google snippet text. Keep 120-160 characters.</li>
          <li><strong>Canonical URL</strong> — Only set if content exists elsewhere (usually leave blank).</li>
          <li><strong>Robots</strong> — Keep as "Index, Follow" unless you don't want Google to index this page.</li>
          <li><strong>Google Preview</strong> — Shows exactly how Google will display your post.</li>
          <li><strong>Word Count / Reading Time</strong> — Aim for 1000+ words for SEO value.</li>
        </ul>

        <h4 className="mt-6 font-semibold text-[#0f172a]">Publishing States</h4>
        <Table headers={["State", "Meaning"]}>
          <Row cells={["Draft", "Saved but not visible on the website"]} />
          <Row cells={["Published", "Live and visible to everyone"]} />
          <Row cells={["Scheduled", "Will auto-publish at the set date/time"]} />
          <Row cells={["Archived", "Hidden from public but not deleted"]} />
        </Table>
      </Section>

      {/* Media */}
      <Section title="🖼️ Media Library" id="media">
        <p>Central storage for all images used across the website.</p>
        <h4 className="mt-4 font-semibold text-[#0f172a]">Actions</h4>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li><strong>Upload</strong> — Click the blue "Upload File" button or drag & drop</li>
          <li><strong>Copy URL</strong> — Hover over image → click 📋 icon → URL copied to clipboard</li>
          <li><strong>Delete</strong> — Hover over image → click 🗑️ icon → confirm</li>
        </ul>
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          ⚠️ You cannot delete an image that's currently used as a blog featured image. Remove it from the blog post first.
        </div>
      </Section>

      {/* Navigation */}
      <Section title="🌐 Navigation" id="navigation">
        <p>Manage the links that appear in your website header and footer.</p>
        <h4 className="mt-4 font-semibold text-[#0f172a]">Actions</h4>
        <Table headers={["Button", "Action"]}>
          <Row cells={["✏️ Pencil", "Edit the link's name or URL"]} />
          <Row cells={["👁 Eye", "Show/hide the link on the live website (hidden links aren't deleted)"]} />
          <Row cells={["🗑️ Trash", "Permanently delete the link"]} />
          <Row cells={["+ Add Item", "Add a new link to that menu section"]} />
        </Table>
        <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          💡 Changes to navigation appear on the live website immediately — no redeploy needed.
        </div>
      </Section>

      {/* Settings */}
      <Section title="⚙️ Settings" id="settings">
        <p>All business configuration in one place. Changes appear on the live site immediately.</p>
        <Table headers={["Tab", "What You Can Edit"]}>
          <Row cells={["General", "Company name, tagline, site URL, copyright text"]} />
          <Row cells={["Branding", "Logo URL, primary color, accent color"]} />
          <Row cells={["Contact", "Phone number, email, WhatsApp, business address"]} />
          <Row cells={["SEO", "Default meta title template, description, keywords, OG image"]} />
          <Row cells={["Analytics", "Google Analytics ID, Tag Manager, Meta Pixel, Clarity"]} />
          <Row cells={["Social", "Instagram, LinkedIn, YouTube, Facebook, Twitter URLs"]} />
          <Row cells={["Legal", "Privacy policy URL, Terms of service URL"]} />
        </Table>
      </Section>

      {/* Users */}
      <Section title="👥 Users" id="users">
        <p>View all registered users and their financial profiles.</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li><strong>Export CSV</strong> — Download all user data as a spreadsheet</li>
          <li><strong>Status</strong> — Active (green), Suspended (yellow), Disabled (red)</li>
          <li><strong>Onboarded</strong> — Shows if user completed the onboarding questionnaire</li>
          <li><strong>Roles</strong> — Shows admin roles (super_admin, admin, editor)</li>
        </ul>
      </Section>

      {/* Audit Logs */}
      <Section title="🛡️ Audit Logs" id="audit">
        <p>Complete activity history. Every admin action is recorded here.</p>
        <Table headers={["Action Type", "Meaning"]}>
          <Row cells={["create", "Something new was created (post, media, nav item)"]} />
          <Row cells={["update", "Something was edited"]} />
          <Row cells={["delete", "Something was removed"]} />
          <Row cells={["publish", "A blog post was published or re-published"]} />
          <Row cells={["status_change", "A user was disabled or enabled"]} />
        </Table>
      </Section>

      {/* Tips */}
      <Section title="💡 Pro Tips" id="tips">
        <ul className="space-y-3">
          <li className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
            <strong>SEO:</strong> Every blog post should have a focus keyword, meta title under 60 chars, and meta description between 120-160 chars.
          </li>
          <li className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
            <strong>Images:</strong> Always add a featured image to blog posts. Posts with images get 94% more views.
          </li>
          <li className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm">
            <strong>Headings:</strong> Use H2 and H3 in your articles. Google uses them to understand your content structure, and they auto-generate a Table of Contents.
          </li>
          <li className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
            <strong>Callout boxes:</strong> Use Info, Warning, and Tip boxes to break up long text. Readers scan — make key points stand out.
          </li>
          <li className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm">
            <strong>Internal links:</strong> Link to other pages on pravix.in within your articles. This helps SEO significantly.
          </li>
        </ul>
      </Section>
    </div>
  );
}

// ── Helper Components ────────────────────────────────────────────────────────

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-xl font-bold text-[#0f172a] border-b border-[#e2e8f0] pb-3 mb-4">{title}</h2>
      <div className="text-sm leading-relaxed text-[#475569]">{children}</div>
    </section>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-[#e2e8f0]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#64748b]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f5f9]">{children}</tbody>
      </table>
    </div>
  );
}

function Row({ cells }: { cells: string[] }) {
  return (
    <tr className="hover:bg-[#f8fafc]">
      {cells.map((cell, i) => (
        <td key={i} className="px-4 py-2.5 text-[#0f172a]">{cell}</td>
      ))}
    </tr>
  );
}
