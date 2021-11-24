const SentryCli = require('@sentry/cli');
async function createReleaseAndUpload() {
  const SENTRY_RELEASE = process.env.SENTRY_RELEASE;
  const release = `${process.env.npm_package_name}@${SENTRY_RELEASE}`;
  if (!release) {
    console.warn('SENTRY_RELEASE is not set');
    return;
  }
  const cli = new SentryCli('../.sentryclirc');
  try {
    console.log('Creating sentry release ' + release);
    await cli.releases.new(release);
    await cli.releases.setCommits(release, {
      auto: true,
      // commit: SENTRY_RELEASE,
      // previousCommit: 'c8c82062',
    });
    console.log('Uploading source maps');
    // await cli.releases.uploadSourceMaps(release, {
    //   include: ['build/static/js'],
    //   urlPrefix: '~/static/js',
    //   rewrite: false,
    // });
    console.log('Finalizing release');
    await cli.releases.finalize(release);
  } catch (e) {
    console.error('Source maps uploading failed:', e);
  }
}
createReleaseAndUpload();
