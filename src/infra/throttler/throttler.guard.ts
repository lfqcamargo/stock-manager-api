import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const {
      context,
      limit,
      ttl,
      throttler,
      blockDuration,
      getTracker,
      generateKey,
    } = requestProps;

    const { req, res } = this.getRequestResponse(context);
    const tracker = await getTracker(req, context);
    const key = generateKey(context, tracker, throttler.name ?? 'default');

    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } =
      await this.storageService.increment(
        key,
        ttl,
        limit,
        blockDuration,
        throttler.name ?? 'default',
      );

    const suffix =
      throttler.name && throttler.name !== 'default'
        ? `-${throttler.name}`
        : '';

    if (isBlocked) {
      res.setHeader(`Retry-After${suffix}`, timeToBlockExpire);
      await this.throwThrottlingException(context, {
        limit,
        ttl,
        key,
        tracker,
        totalHits,
        timeToExpire,
        isBlocked,
        timeToBlockExpire,
      });
    }

    res.setHeader(`${this.headerPrefix}-Limit${suffix}`, limit);
    res.setHeader(
      `${this.headerPrefix}-Remaining${suffix}`,
      Math.max(0, limit - totalHits),
    );
    res.setHeader(`${this.headerPrefix}-Reset${suffix}`, timeToExpire);

    return true;
  }
}

// The tracker is defined globally via ThrottlerModule.forRootAsync with getTracker
// using req.ip + user-agent, so no need to override getTracker here.
// If custom tracking per-request is needed, configure it at the module level.
