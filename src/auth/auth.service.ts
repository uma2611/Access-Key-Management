import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Dummy admin data
const adminData = [
  {
    id: 1,
    username: 'Uma Shankar',
    password: 'Uma123',
  },
  {
    id: 2,
    username: 'Jhon',
    password: 'Jhon123',
  },
];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Check User data, If User exists in Dummy data retun the token.
  async validateUser(username: string, password: string) {
    const user = adminData.find((user) => user.username === username);
    if (!user) return null;
    if (user.password === password) {
      return this.jwtService.sign({ username, password });
    }
  }
}
