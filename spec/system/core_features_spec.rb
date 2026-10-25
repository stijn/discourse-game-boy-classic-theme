# frozen_string_literal: true

# Parts of the core features examples can be skipped like so:
#   it_behaves_like "having working core features", skip_examples: %i[login likes]
#
# List of keywords for skipping examples:
# login, likes, profile, topics, topics:read, topics:reply, topics:create,
# search, search:quick_search, search:full_page
#
# For more details, see https://meta.discourse.org/t/-/361381
RSpec.describe "Core features" do
  let!(:theme) { upload_theme_or_component }

  # The core examples match visible text case-sensitively, and the theme's
  # uppercase styling would make "This is a topic" render as "THIS IS A TOPIC".
  # Every other style and setting stays at its default.
  before do
    theme.update_setting(:uppercase_text, false)
    theme.save!
  end

  it_behaves_like "having working core features"
end
