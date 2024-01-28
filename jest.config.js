// jest.config
require('dotenv').config({path: '.env.test'})

module.exports = {
    collectCoverageFrom: ['src/**/*.{ts,js}'],
    coverageDirectory: 'coverage',
    moduleFileExtensions: ['ts', 'js', 'json'],
    testEnvironment: 'node',
    testMatch: ['**/?(*.)(spec|test).ts?(x)'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    moduleNameMapper: {
        '@config/(.*)': '<rootDir>/src/config/$1',
        '@domains/(.*)': '<rootDir>src/domains/$1',
        '@shared/(.*)': '<rootDir>/src/shared/$1'
    },
    preset: 'ts-jest',
    modulePathIgnorePatterns: ['<rootDir>/dist'],
    fakeTimers: {'enableGlobally': true}
}
