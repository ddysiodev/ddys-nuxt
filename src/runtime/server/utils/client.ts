import type { H3Event } from 'h3';
import type { DdysConfigInput } from '../../config';
import { DdysClient } from '../../client/client';
import { getDdysConfig } from './config';

export function createDdysServerClient(event?: H3Event, config: DdysConfigInput = {}) {
  return new DdysClient(getDdysConfig(event, config));
}
