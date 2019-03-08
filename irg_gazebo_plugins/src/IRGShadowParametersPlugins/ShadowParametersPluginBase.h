/*******************************************************************************
 * Copyright (c) 2018 United States Government as represented by the 
 * Administrator of the National Aeronautics and Space Administration. 
 * All rights reserved.
 ******************************************************************************/
#ifndef ShadowParametersPluginBase_h
#define ShadowParametersPluginBase_h

#include "gazebo/common/Plugin.hh"
#include "gazebo/util/system.hh"

namespace gazebo {

  // Base class contains meat of the code
  class ShadowParametersPluginBase
  {
  public: 
    ShadowParametersPluginBase(){}
    ~ShadowParametersPluginBase(){}

    virtual std::string GetClassName() = 0;

    void LoadBase(sdf::ElementPtr _sdf);
  };

}

#endif // ShadowParametersPluginBase_h
