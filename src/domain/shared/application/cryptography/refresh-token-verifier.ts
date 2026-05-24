export abstract class RefreshTokenVerifier {
  abstract verify(token: string): Promise<{ userId: string } | null>;
}
