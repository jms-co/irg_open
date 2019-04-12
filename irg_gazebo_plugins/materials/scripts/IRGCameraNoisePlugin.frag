// This shader is an adaptation of Gazebo's camera_noise_gaussian_fs.glsl,
// licensed under the Apache License, Version 2.0. It is modified to apply our
// own noise formula that is dependent on the pixel brightness from the base
// image.

// This fragment shader will add Gaussian noise to a rendered image.  It's
// intended to be instantiated via Ogre's Compositor framework so that we're
// operating on a previously rendered image.  We're doing it a shader for
// efficiency: a naive CPU implementation slows camera rates from 30Hz to 10Hz,
// while this GPU implementation has no noticable effect on performance.
//
// We're applying additive amplifier noise, as described at:
// http://en.wikipedia.org/wiki/Image_noise#Amplifier_noise_.28Gaussian_noise.29
// This is uncorrelated Gaussian noise added to each pixel.  For each pixel, we
// want to sample a new value from a Gaussian distribution and add it to each
// channel in the input image.
//
// There isn't (as far as I can tell) a way to generate random values in GLSL.
// The GPU vendors apparently don't implement the noise[1-4]() functions that
// are described in the documentation.  What we do have is a deterministic 
// function that does a decent job of appoximating a uniform distribution 
// on [0,1].  But it requires a 2-D vector as input.
//
// So we're doing something mildly complicated:
//
// 1. On the CPU, before each call to this shader, generate 3 random numbers
// that are uniformly distributed on [0,1.0] and pass them here,
// in the `offsets` parameter.
//
// 2. Each time we need a random number here, add one of the CPU-provided
// offsets to our current pixel coordinates and give the resulting vector to our
// pseudo-random number generator.
// 
// 3. Implement the Box-Muller method to sample from a Gaussian distribution.
// Normally each iteration of this method requires 2 uniform inputs and
// gives 2 Gaussian outputs.  We're using 3 uniform inputs, with the 3rd 
// being used to select randomly between the 2 Gaussian outputs.
//
// 4. Having produced a Gaussian sample, we add this value to each channel of
// the input image.

// The input texture, which is set up by the Ogre Compositor infrastructure.
uniform sampler2D RT;

// Other parameters are set in C++, via
// Ogre::GpuProgramParameters::setNamedConstant()

// Random values sampled on the CPU, which we'll use as offsets into our 2-D
// pseudo-random sampler here.
uniform vec3 offsets;
// Mean of the Gaussian distribution that we want to sample from.
//uniform float mean;
// Standard deviation of the Gaussian distribution that we want to sample from.
//uniform float stddev;


#define PI 3.14159265358979323846264

float rand(vec2 co)
{
  // This one-liner can be found in many places, including:
  // http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
  // I can't find any explanation for it, but experimentally it does seem to
  // produce approximately uniformly distributed values in the interval [0,1].
  float r = fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);

  // Make sure that we don't return 0.0
  if(r == 0.0)
    return 0.000000000001;
  else
    return r;
}

vec4 gaussrand(float I, vec2 co)
{
  // Box-Muller method for sampling from the normal distribution
  // http://en.wikipedia.org/wiki/Normal_distribution#Generating_values_from_normal_distribution
  // This method requires 2 uniform random inputs and produces 2 
  // Gaussian random outputs.  We'll take a 3rd random variable and use it to
  // switch between the two outputs.

  float U, V, R, Z;
  // Add in the CPU-supplied random offsets to generate the 3 random values that
  // we'll use.
  U = rand(co + vec2(offsets.x, offsets.x));
  V = rand(co + vec2(offsets.y, offsets.y));
  R = rand(co + vec2(offsets.z, offsets.z));
  // Switch between the two random outputs.
  if(R < 0.5)
    Z = sqrt(-2.0 * log(U)) * sin(2.0 * PI * V);
  else
    Z = sqrt(-2.0 * log(U)) * cos(2.0 * PI * V);

  // Apply the stddev and mean.
  //Z = Z * stddev + mean;

  // Larry's noise formula
  float stddev = sqrt(0.64 + 0.09 * I * 4095.0) / 4095.0;
  Z = Z * stddev;

  // Return it as a vec4, to be added to the input ("true") color.
  return vec4(Z, Z, Z, 0.0);
}

void main()
{
  vec4 baseColor = texture2D(RT, gl_TexCoord[0].xy);

  // Add the sampled noise to the input color and clamp the result to a valid range.
  // The red channel is used for image intensity because our simulation is all grayscale.
  gl_FragColor = clamp(baseColor + gaussrand(baseColor.r, gl_TexCoord[0].xy), 0.0, 1.0);
}
