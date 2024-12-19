---
name: Release
about: Prepare for a release
labels: maintenance
---

## Release Checklist

- [ ] merge all outstanding feature PRs
- [ ] make a preflight PR
  - [ ] ensure the versions have been bumped (check with `pixi run test`)
  - [ ] ensure the CHANGELOG is up-to-date
  - [ ] validate on [ReadTheDocs]
- [ ] wait for a successful build of [`main`][main]
- [ ] download the `dist` archive and unpack somewhere (maybe a fresh `dist`)
- [ ] create a [release] through the GitHub UI
  - [ ] paste in the relevant CHANGELOG entries
  - [ ] upload the artifacts
- [ ] actually upload to [`pypi.org`][pypi] and [`npmjs.org`][npm]

  ```bash
  cd dist
  twine upload *.tar.gz *.whl
  npm login
  npm publish deathbeds-urljsf*.tgz
  npm logout
  ```

- [ ] postmortem
  - [ ] handle `conda-forge` [feedstock] tasks
  - [ ] make a postmortem PR
    - [ ] bump to next version
    - [ ] bump the `CACHE_EPOCH`
    - [ ] rebuild `pixi.lock` and `yarn.lock`
    - [ ] update release procedures with lessons learned

[pypi]: https://pypi.org/project/urljsf/#history
[npm]: https://www.npmjs.com/package/@deathbeds/urljsf?activeTab=versions
[main]: https://github.com/deathbeds/urljsf/actions?query=branch%3Amain+event%3Apush
[readthedocs]: https://urljsf.readthedocs.io/en/latest
[release]: https://github.com/deathbeds/urljsf/releases/new
[feedstock]:
  https://github.com/conda-forge/urljsf-feedstock/issues/new?template=2-bot-commands.yml&title=@conda-forge-admin+please+update+version
