# git-slice-tools

A new version of git-slice, super high performance with:

- git-cli (simple-git): for performing git commands.
- dir-compare: for detecting file changes between 2 repo folders with glob patterns file ignores support
- glob: Now support glob patterns for flexibility configurations of ignoring files
- support: mapping branch name between upstream/slice repos, commit messages validation and non-force push

## Environment variables

| Name                                     | Description                                                                                                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GIT_SLICE_UPSTREAM_REPO_DIR`            | Relation/absolute path to directory which contains upstream source                                                                                                                         |
| `GIT_SLICE_UPSTREAM_REPO_DEFAULT_BRANCH` | Name of default branch of upstream repo                                                                                                                                                    |
| `GIT_SLICE_UPSTREAM_REPO_USERNAME`       | Username for git authentication and commit details on upstream repo                                                                                                                        |
| `GIT_SLICE_UPSTREAM_REPO_EMAIL`          | User email for git authentication and commit details on upstream repo                                                                                                                      |
| `GIT_SLICE_UPSTREAM_REPO_PASSWORD`       | Personal Access Token for git authentication on upstream repo                                                                                                                              |
| `GIT_SLICE_UPSTREAM_REPO_URL`            | Http git url of upstream repo, should be in this format : https://github.com/GitStartHQ/client-sourcegraph.git                                                                             |
| `GIT_SLICE_SLICE_REPO_DIR`               | Relation/absolute path to directory which contains slice source                                                                                                                            |
| `GIT_SLICE_SLICE_REPO_DEFAULT_BRANCH`    | Name of default branch of slice repo                                                                                                                                                       |
| `GIT_SLICE_SLICE_REPO_USERNAME`          | Username for git authentication and commit details on slice repo                                                                                                                           |
| `GIT_SLICE_SLICE_REPO_EMAIL`             | User email for git authentication and commit details on slice repo                                                                                                                         |
| `GIT_SLICE_SLICE_REPO_PASSWORD`          | Personal Access Token for git authentication on slice repo                                                                                                                                 |
| `GIT_SLICE_SLICE_REPO_URL`               | Http git url of slice repo, should be in this format : https://github.com/GitStartHQ/client-sourcegraph.git                                                                                |
| `GIT_SLICE_SLICE_IGNORES`                | Array of glob patterns which are used to ignore files when syncing changes between 2 repos. ex: `['.git-slice.json', 'dev/*']`                                                             |
| `GIT_SLICE_PUSH_BRANCH_NAME_TEMPLATE`    | Pattern for building branch name in upstream repo when pushing a branch in slice repo, git-slice-tools would replace `<branch_name>` with the name pushing branch. ex: `dev/<branch_name>` |
| `GIT_SLICE_PUSH_COMMIT_MSG_REGEX`        | Regular expression which is used to validate commit messages                                                                                                                               |
| `GIT_SLICE_FORCE_GIT_INIT`               | (`true` or `false`). Default is `true`. git-slice-tools would reset git configs in every run times                                                                                         |
| `GIT_SLICE_PR_LABELS`                    | Array of labels which git-slice-tools will add into new PR. Ex: ex: `["gitstart","team/frontend-platform"`                                                                                 |
| `GIT_SLICE_PR_DRAFT`                     | (`true` or `false`). Default is `true`. git-slice-tools would raise new PR as draft PR                                                                                                     |

## Development

To use `git-slice-tools` in dev mode, clone `git-slice-tools` repository

```bash
# Clone repository
git clone https://github.com/GitStartHQ/git-slice-tools

# Navigate to source code container folder
cd git-slice-tools

# yarn install
yarn

# Prepare environment variables in .env file from .env.example (Please update copied .env file before executing jobs)
cp .env.example .env

# Execute jobs
yarn <job_name> [...job_options] [--help] [--version]
```

We don't recommend to use `nodemon` for development since it could effect production repositories. But in case you really want to use it you can use this form:

```bash
yarn dev --exec "yarn pull"
```

## Global CLI

You can install and use `git-slice-tools` globally

```bash
# Install package globally

# With yarn
yarn global add https://github.com/GitStartHQ/git-slice-tools#vX.X.X

# With npm
npm install -g https://github.com/GitStartHQ/git-slice-tools#vX.X.X

# Execute jobs
git-slice-tools <job_name> [...job_options] [--help] [--version]
```

## Jobs

| Name          | Description                                                                                                                                                                                                                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkout`    | Fetch `origin` and checkout default branch of both upstream and slice repos                                                                                                                                                                                                                                                             |
| `pull`        | Pull last changes from upstream repo into slice repo                                                                                                                                                                                                                                                                                    |
| `push`        | Push a branch in slice repo to upstream repo                                                                                                                                                                                                                                                                                            |
| `raise-pr`    | Raise new PR for branch on upstream repo (GitHub only) with details (title/body) from the PR for a branch on slice repo                                                                                                                                                                                                                 |
| `pull-branch` | Pull last changes of a branch from upstream repo into slice repo. The destination branch in slice repo has the pulling branch but with `upstream-*` prefix. Please note that this job uses `force-push` and the upstream should be updated to date with the default branch of upstream repo otherwise there would be some extra changes |
| `pull-review` | Pull a PR review from a PR on upstream repo into a PR on slice repo (GitHub only). Please note that if upstream review has comments on code, this job will throw errors if upstream and slice branches don't have the same changes                                                                                                      |

### Job `checkout`

No command arguments needed

```bash
yarn checkout

git-slice-tools checkout
```

### Job `pull`

No command arguments needed

```bash
yarn pull

git-slice-tools pull
```

### Job `push`

Command arguments

| Arg              | Description                               |
| ---------------- | ----------------------------------------- |
| `--branch` `-b`  | Name of pushing branch in slice repo      |
| `--message` `-m` | Commit message                            |
| `--force-push`   | Determine wether to use force push or not |

```bash
yarn push --branch dev-test --message "test: commit message" --force-push false

git-slice-tools push --branch dev-test --message "test: commit message" --force-push false
```

### Job `raise-pr`

Command arguments

| Arg             | Description                          |
| --------------- | ------------------------------------ |
| `--branch` `-b` | Name of pushing branch in slice repo |

```bash
yarn raise-pr --branch dev-test

git-slice-tools raise-pr --branch dev-test
```

### Job `pull-branch`

Command arguments

| Arg             | Description                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| `--branch` `-b` | Name of pulling branch in upstream repo                                                                           |
| `--target` `-g` | Name of target branch in slice repo. If it's passed, git-slice will create a PR (target branch <- pulling branch) |

```bash
yarn pull-branch --branch dev-test

git-slice-tools pull-branch --branch dev-test
```

### Job `pull-review`

Command arguments

| Arg                | Description                                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--pr-number`      | PR number on slice repo which you want to pull a review into                                                                                                                                                                                                                                |
| `--pr-review-link` | The link of pull request review you want to pull from, ex: https://github.com/sourcegraph/sourcegraph/pull/37919#pullrequestreview-1025518547 . Actually git-slice-tools only care about `/pull/<pull_id>#pullrequestreview-<review_id>` part for getting pull request number and review id |

```bash
yarn pull-review --pr-number 123 --pr-review-link https://github.com/sourcegraph/sourcegraph/pull/37919#pullrequestreview-1025518547

git-slice-tools pull-review --pr-number 123 --pr-review-link https://github.com/sourcegraph/sourcegraph/pull/37919#pullrequestreview-1025518547
```

## Future jobs

| Job                            | Description                                                               |
| ------------------------------ | ------------------------------------------------------------------------- |
| GitStart dashboard integration | Support GitStart authentication and fetching repos details from dashboard |
