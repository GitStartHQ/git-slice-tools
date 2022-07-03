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

## Jobs

| Job           | Description                                                                                                                                                                                                                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkout`    | Fetch `origin` and checkout default branch of both upstream and slice repos                                                                                                                                                                                                                                                             |
| `pull`        | Pull last changes from upstream repo into slice repo                                                                                                                                                                                                                                                                                    |
| `push`        | Push a branch in slice repo to upstream repo                                                                                                                                                                                                                                                                                            |
| `raise-pr`    | Raise new PR for branch on upstream repo (GitHub only for now)                                                                                                                                                                                                                                                                          |
| `pull-branch` | Pull last changes of a branch from upstream repo into slice repo. The destination branch in slice repo has the pulling branch but with `upstream-*` prefix. Please note that this job uses `force-push` and the upstream should be updated to date with the default branch of upstream repo otherwise there would be some extra changes |

### Job `checkout`

No command arguments needed

```bash
yarn checkout
```

### Job `pull`

No command arguments needed

```bash
yarn pull
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
```

### Job `raise-pr`

Command arguments

| Arg                  | Description                          |
| -------------------- | ------------------------------------ |
| `--branch` `-b`      | Name of pushing branch in slice repo |
| `--title` `-t`       | PR title                             |
| `--description` `-d` | PR description                       |

```bash
yarn raise-pr --branch dev-test --title "The pull request title" --description "The pull request description"
```

### Job `pull-branch`

Command arguments

| Arg             | Description                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| `--branch` `-b` | Name of pulling branch in upstream repo                                                                           |
| `--target` `-g` | Name of target branch in slice repo. If it's passed, git-slice will create a PR (target branch <- pulling branch) |

```bash
yarn pull-branch --branch dev-test
```

## Future jobs

| Job                                                                                                   | Description                                                               |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| GitStart dashboard integration                                                                        | Support GitStart authentication and fetching repos details from dashboard |
| Pull a specific branch from upstream repo to slice repo                                               | ...                                                                       |
| Push a branch in slice repo to upstream repo with any base branches (shouldn't be the default branch) | ...                                                                       |
