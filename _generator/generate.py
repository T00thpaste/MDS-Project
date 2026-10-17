"""
Builds the MDS project website skeleton.

  python generate.py            -> creates any team folder that does not exist yet
  python generate.py --force    -> overwrites ALL team folders (teams lose their edits!)

Only run this BEFORE you hand the folders to the teams.
Change NUM_TEAMS below if the number of teams changes.
"""
import os
import sys

NUM_TEAMS = 22

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TEAMS_DIR = os.path.join(ROOT, "teams")

FONTS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800'
    '&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">'
)

def hero(title, lede, edit=""):
    return f"""
  <section class="page-hero">
    <canvas class="field" aria-hidden="true"></canvas>
    <div class="wrap">
      {edit}<h1 data-scramble>{title}</h1>
      <p class="lede">{lede}</p>
    </div>
  </section>
"""

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  {fonts}
  <link rel="stylesheet" href="{css}">
</head>
"""

# ---------------------------------------------------------------- team pages

def header(num, current):
    def link(href, label, key):
        cur = ' aria-current="page"' if key == current else ""
        return f'<a href="{href}"{cur}>{label}</a>'
    return f"""<body>
  <header class="site-header">
    <div class="wrap bar">
      <div class="brand-group">
        <a class="back" href="../../index.html">All teams</a>
        <!-- EDIT: team name (also change it in the other two pages) -->
        <span class="brand">Team {num}</span>
      </div>
      <nav class="tabs" aria-label="Team pages">
        {link("index.html", "Project", "project")}
        {link("results.html", "Results", "results")}
        {link("team.html", "Team", "team")}
      </nav>
    </div>
  </header>
"""

FOOTER = """
  <footer class="site-footer">
    <div class="wrap">MDS Project, IIT Dharwad</div>
  </footer>
  <script src="../../assets/site.js" defer></script>
</body>
</html>
"""


def project_page(num):
    return (
        HEAD.format(title=f"Team {num} | Project", fonts=FONTS, css="../../assets/style.css")
        + header(num, "project")
        + """
"""
        + hero("Your project title goes here", "One or two sentences that tell a visitor what this project is about and why it matters.",
               "<!-- EDIT: your project title and a one or two line summary -->\n      ")
        + """
  <main class="wrap prose">

    <!-- EDIT: describe the problem statement (PS) your team was given -->
    <h2>Problem statement</h2>
    <p>Describe the problem your team is solving. Say what question you are trying to answer and what the final outcome should look like.</p>
    <p>Add more paragraphs by copying a &lt;p&gt; line like this one.</p>

    <h2>Dataset</h2>
    <p>Where the data comes from, how many rows and columns it has, and what each important column means.</p>

    <h2>Approach</h2>
    <p>Briefly explain the steps you followed, from cleaning the data to producing the final results.</p>
    <ul>
      <li>Step or method one</li>
      <li>Step or method two</li>
      <li>Step or method three</li>
    </ul>

    <h2>Tools used</h2>
    <p>Python, pandas, matplotlib (replace with your own list).</p>

    <p class="next"><a class="button" href="results.html">See the results</a> <a class="button alt" href="team.html">Meet the team</a></p>
  </main>
"""
        + FOOTER
    )


def results_page(num):
    return (
        HEAD.format(title=f"Team {num} | Results", fonts=FONTS, css="../../assets/style.css")
        + header(num, "results")
        + """
"""
        + hero("Results", "Graphs from the project, with an explanation of what each one shows.")
        + """
  <main class="wrap">

    <!--
      HOW TO ADD A GRAPH
      1. Save your image inside this team's "images" folder (for example images/graph1.png).
      2. Copy everything from "BEGIN RESULT" to "END RESULT" and paste it below the last result.
      3. Change the image name, the alt text, the title and the explanation.
    -->

    <!-- BEGIN RESULT -->
    <section class="result">
      <figure>
        <!-- EDIT: replace the src with images/your-graph.png -->
        <img src="../../assets/placeholder.svg" alt="Describe the graph in one sentence">
        <figcaption>Figure 1. Short caption for the graph.</figcaption>
      </figure>
      <div class="result-text">
        <h2>Title of this result</h2>
        <p>Explain what the graph shows and what a reader should notice first.</p>
        <p>Add anomalies, patterns or observations you found in the data here.</p>
      </div>
    </section>
    <!-- END RESULT -->

    <!-- BEGIN RESULT -->
    <section class="result">
      <figure>
        <img src="../../assets/placeholder.svg" alt="Describe the graph in one sentence">
        <figcaption>Figure 2. Short caption for the graph.</figcaption>
      </figure>
      <div class="result-text">
        <h2>Title of this result</h2>
        <p>Explain what the graph shows and what a reader should notice first.</p>
        <p>Add anomalies, patterns or observations you found in the data here.</p>
      </div>
    </section>
    <!-- END RESULT -->

    <div class="prose summary">
      <!-- EDIT: sum up the main findings -->
      <h2>Anomalies, observations and patterns</h2>
      <ul>
        <li><strong>Anomaly:</strong> something unusual in the data and a likely reason for it.</li>
        <li><strong>Observation:</strong> something you measured or noticed.</li>
        <li><strong>Pattern:</strong> a trend that repeats across the dataset.</li>
      </ul>
    </div>

    <p class="next"><a class="button" href="team.html">Meet the team</a> <a class="button alt" href="index.html">Back to the project</a></p>
  </main>
"""
        + FOOTER
    )


MEMBER = """      <!-- BEGIN MEMBER -->
      <article class="member">
        <!-- EDIT: save a square photo in this team's images folder and change the src to images/yourname.jpg (it is shown as a circle) -->
        <img src="../../assets/avatar.svg" alt="Photo of Member Name">
        <h2>Member name</h2>
        <p class="meta">Roll number, branch</p>
        <p>Two or three lines about yourself: your interests, skills, and what you worked on in this project.</p>
      </article>
      <!-- END MEMBER -->
"""


def team_page(num):
    return (
        HEAD.format(title=f"Team {num} | Team", fonts=FONTS, css="../../assets/style.css")
        + header(num, "team")
        + f"""
"""
        + hero("Meet the team", "The people behind this project.")
        + f"""
  <main class="wrap">

    <!-- EDIT: team photo or logo. Save it as images/team.jpg (png or webp also work) inside this team's folder.
         It replaces the placeholder here and also appears on your tile on the main page. -->
    <img class="team-dp" data-team-photo src="../../assets/team-placeholder.svg" alt="Team photo or logo">

    <!-- Teams have 1 to 4 members. Delete the member blocks you do not need (everything from "BEGIN MEMBER" to "END MEMBER"). To add one, copy a block and paste it below. -->
    <div class="members">
{MEMBER * 4}    </div>

    <p class="next"><a class="button" href="results.html">See the results</a> <a class="button alt" href="index.html">Back to the project</a></p>
  </main>
"""
        + FOOTER
    )


# ------------------------------------------------------------------ hub page

def hub_page():
    teams = ",\n".join(
        f'    {{ name: "Team {n}", topic: "Project title to be added", folder: "team{n:02d}" }}'
        for n in range(1, NUM_TEAMS + 1)
    )
    return (
        HEAD.format(title="MDS Project", fonts=FONTS, css="assets/style.css")
        + """<body>
  <header class="site-header">
    <div class="wrap bar">
      <span class="brand">MDS Project</span>
      <a class="jump" href="#teams">Browse teams</a>
    </div>
  </header>

  <section class="page-hero hub">
    <canvas class="field" aria-hidden="true"></canvas>
    <div class="wrap">
      <h1 data-scramble>MDS Project</h1>
      <p class="lede">Every team has its own site with its problem statement, results and members. Pick yours below.</p>
    </div>
  </section>

  <main class="wrap" id="teams">
    <div class="toolbar">
      <h2>Find your team</h2>
      <label class="search">
        <span class="visually-hidden">Search teams</span>
        <input id="search" type="search" placeholder="Search by team number or project title" autocomplete="off">
      </label>
    </div>
    <ul class="team-grid" id="team-grid"></ul>
    <p class="empty" id="empty" hidden>No team matches your search.</p>
  </main>

  <footer class="site-footer">
    <div class="wrap">MDS Project, IIT Dharwad</div>
  </footer>

  <script>
    // Default tile text. Each team overrides it from its own folder (teams/teamNN/info.js), so you do not need to edit this.
    window.TEAMS = [
"""
        + teams
        + """
    ];
  </script>
  <script src="assets/site.js" defer></script>
</body>
</html>
"""
    )


INFO = """// EDIT: this is what shows on your team's tile on the main page.
// Change the two texts between the quotes. Do not change anything else.
window.TEAM_INFO = window.TEAM_INFO || {{}};
window.TEAM_INFO["{folder}"] = {{
  name: "Team {n}",
  topic: "Project title to be added"
}};
"""


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def main():
    force = "--force" in sys.argv
    write(os.path.join(ROOT, "index.html"), hub_page())
    made, skipped = 0, 0
    for n in range(1, NUM_TEAMS + 1):
        folder = os.path.join(TEAMS_DIR, f"team{n:02d}")
        info = os.path.join(folder, "info.js")
        if not os.path.exists(info):
            write(info, INFO.format(folder=f"team{n:02d}", n=n))
        if os.path.exists(os.path.join(folder, "index.html")) and not force:
            skipped += 1
            continue
        write(os.path.join(folder, "index.html"), project_page(n))
        write(os.path.join(folder, "results.html"), results_page(n))
        write(os.path.join(folder, "team.html"), team_page(n))
        write(
            os.path.join(folder, "images", "put-your-images-here.txt"),
            "Save your graphs and team photos in this folder, then use the file name in your HTML.\n",
        )
        made += 1
    print(f"Hub page written. Team folders created: {made}, left untouched: {skipped}")


if __name__ == "__main__":
    main()
